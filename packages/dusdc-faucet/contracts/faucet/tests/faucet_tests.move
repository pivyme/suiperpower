#[test_only]
module faucet::faucet_tests {
    use faucet::faucet::{
        Self,
        Faucet,
        AdminCap,
        new_for_testing,
        claim,
        return_quote,
        refill,
        recover_quote,
        recover_sui,
        emergency_withdraw_all,
        set_rate,
        set_per_tx_cap,
        set_daily_cap,
        set_paused,
        set_return_enabled,
        quote_balance,
        sui_balance,
        total_served_quote,
        total_claims,
    };
    use sui::balance;
    use sui::clock::{Self, Clock};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::test_scenario::{Self as ts, Scenario};
    use sui::test_utils;

    public struct QUOTE has drop {}

    const PUBLISHER: address = @0xA11CE;
    const USER: address = @0xB0B;
    const OTHER: address = @0xCAFE;
    const RECOVERY_ADMIN: address =
        @0x3935bbb26c147851285c0fd76c712e5ccc7669908c2327a1301db52563b12e71;

    const ONE_SUI_MIST: u64 = 1_000_000_000;
    const HUNDRED_DUSDC_BASE: u64 = 100_000_000; // 100 * 10^6
    const ONE_DAY_MS: u64 = 86_400_000;

    // Build a Faucet preloaded with `quote_amount` base-units of quote liquidity.
    // Returns (scenario_continued, clock). The Faucet and AdminCap are sent to PUBLISHER
    // and re-taken in subsequent ts::next_tx blocks.
    fun setup_funded(scenario: &mut Scenario, quote_amount: u64): Clock {
        ts::next_tx(scenario, PUBLISHER);
        let ctx = ts::ctx(scenario);
        let clock = clock::create_for_testing(ctx);
        let (mut faucet, admin) = new_for_testing<QUOTE>(ctx);
        // Fund quote vault via test mint helper, then refill.
        let quote_coin = coin::mint_for_testing<QUOTE>(quote_amount, ctx);
        refill<QUOTE>(&mut faucet, quote_coin, ctx);
        faucet::share_for_testing(faucet);
        sui::transfer::public_transfer(admin, PUBLISHER);
        clock
    }

    fun mint_sui(scenario: &mut Scenario, amount_mist: u64): Coin<SUI> {
        let ctx = ts::ctx(scenario);
        coin::mint_for_testing<SUI>(amount_mist, ctx)
    }

    fun mint_quote(scenario: &mut Scenario, amount: u64): Coin<QUOTE> {
        let ctx = ts::ctx(scenario);
        coin::mint_for_testing<QUOTE>(amount, ctx)
    }

    #[test]
    fun test_claim_happy_path() {
        let mut scenario = ts::begin(PUBLISHER);
        let clock = setup_funded(&mut scenario, 1_000 * 1_000_000); // 1000 DUSDC

        ts::next_tx(&mut scenario, USER);
        {
            let mut faucet = ts::take_shared<Faucet<QUOTE>>(&scenario);
            let payment = mint_sui(&mut scenario, ONE_SUI_MIST);
            claim<QUOTE>(&mut faucet, payment, &clock, ts::ctx(&mut scenario));

            assert!(total_claims<QUOTE>(&faucet) == 1, 100);
            assert!(total_served_quote<QUOTE>(&faucet) == HUNDRED_DUSDC_BASE, 101);
            assert!(sui_balance<QUOTE>(&faucet) == ONE_SUI_MIST, 102);
            ts::return_shared(faucet);
        };

        // Verify user received exactly 100 DUSDC base-units.
        ts::next_tx(&mut scenario, USER);
        {
            let received = ts::take_from_address<Coin<QUOTE>>(&scenario, USER);
            assert!(coin::value(&received) == HUNDRED_DUSDC_BASE, 103);
            ts::return_to_address(USER, received);
        };

        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = 2, location = faucet)]
    fun test_claim_over_per_tx_cap() {
        let mut scenario = ts::begin(PUBLISHER);
        let clock = setup_funded(&mut scenario, 1_000 * 1_000_000);

        ts::next_tx(&mut scenario, USER);
        let mut faucet = ts::take_shared<Faucet<QUOTE>>(&scenario);
        let payment = mint_sui(&mut scenario, 2 * ONE_SUI_MIST);
        claim<QUOTE>(&mut faucet, payment, &clock, ts::ctx(&mut scenario));

        ts::return_shared(faucet);
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = 3, location = faucet)]
    fun test_claim_over_daily_wallet_cap() {
        let mut scenario = ts::begin(PUBLISHER);
        let clock = setup_funded(&mut scenario, 1_000 * 1_000_000);

        // Five successful claims at 1 SUI each (caps allow 5 SUI/day).
        let mut i = 0;
        while (i < 5) {
            ts::next_tx(&mut scenario, USER);
            let mut faucet = ts::take_shared<Faucet<QUOTE>>(&scenario);
            let payment = mint_sui(&mut scenario, ONE_SUI_MIST);
            claim<QUOTE>(&mut faucet, payment, &clock, ts::ctx(&mut scenario));
            ts::return_shared(faucet);
            i = i + 1;
        };

        // Sixth must abort with E_OVER_DAILY_WALLET_CAP.
        ts::next_tx(&mut scenario, USER);
        let mut faucet = ts::take_shared<Faucet<QUOTE>>(&scenario);
        let payment = mint_sui(&mut scenario, ONE_SUI_MIST);
        claim<QUOTE>(&mut faucet, payment, &clock, ts::ctx(&mut scenario));

        ts::return_shared(faucet);
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    fun test_daily_reset() {
        let mut scenario = ts::begin(PUBLISHER);
        let mut clock = setup_funded(&mut scenario, 1_000 * 1_000_000);

        // Exhaust daily cap.
        let mut i = 0;
        while (i < 5) {
            ts::next_tx(&mut scenario, USER);
            let mut faucet = ts::take_shared<Faucet<QUOTE>>(&scenario);
            let payment = mint_sui(&mut scenario, ONE_SUI_MIST);
            claim<QUOTE>(&mut faucet, payment, &clock, ts::ctx(&mut scenario));
            ts::return_shared(faucet);
            i = i + 1;
        };

        // Advance one day + 1ms.
        clock::increment_for_testing(&mut clock, ONE_DAY_MS + 1);

        // Fresh claim should succeed.
        ts::next_tx(&mut scenario, USER);
        let mut faucet = ts::take_shared<Faucet<QUOTE>>(&scenario);
        let payment = mint_sui(&mut scenario, ONE_SUI_MIST);
        claim<QUOTE>(&mut faucet, payment, &clock, ts::ctx(&mut scenario));
        assert!(total_claims<QUOTE>(&faucet) == 6, 200);
        ts::return_shared(faucet);

        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    fun test_return_happy_path() {
        let mut scenario = ts::begin(PUBLISHER);
        let clock = setup_funded(&mut scenario, 1_000 * 1_000_000);

        // Seed vault with SUI by doing a claim first.
        ts::next_tx(&mut scenario, USER);
        {
            let mut faucet = ts::take_shared<Faucet<QUOTE>>(&scenario);
            let payment = mint_sui(&mut scenario, ONE_SUI_MIST);
            claim<QUOTE>(&mut faucet, payment, &clock, ts::ctx(&mut scenario));
            ts::return_shared(faucet);
        };

        // Now return all 100 DUSDC.
        ts::next_tx(&mut scenario, USER);
        {
            let mut faucet = ts::take_shared<Faucet<QUOTE>>(&scenario);
            let returned_quote = ts::take_from_address<Coin<QUOTE>>(&scenario, USER);
            return_quote<QUOTE>(&mut faucet, returned_quote, &clock, ts::ctx(&mut scenario));
            assert!(sui_balance<QUOTE>(&faucet) == 0, 300);
            ts::return_shared(faucet);
        };

        // User should now hold a Coin<SUI> worth 1 SUI.
        ts::next_tx(&mut scenario, USER);
        {
            let got = ts::take_from_address<Coin<SUI>>(&scenario, USER);
            assert!(coin::value(&got) == ONE_SUI_MIST, 301);
            ts::return_to_address(USER, got);
        };

        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = 8, location = faucet)]
    fun test_return_dust() {
        let mut scenario = ts::begin(PUBLISHER);
        let clock = setup_funded(&mut scenario, 1_000 * 1_000_000);

        // USER must claim first to be eligible to return; the ledger needs to hold >= the dust quote_in.
        ts::next_tx(&mut scenario, USER);
        {
            let mut faucet = ts::take_shared<Faucet<QUOTE>>(&scenario);
            let payment = mint_sui(&mut scenario, ONE_SUI_MIST);
            claim<QUOTE>(&mut faucet, payment, &clock, ts::ctx(&mut scenario));
            ts::return_shared(faucet);
        };

        // Skew rate so 1 base unit of quote rounds to 0 MIST: sui_out = 1 * 1 * 1000 / 10_000_000_000 = 0.
        ts::next_tx(&mut scenario, PUBLISHER);
        {
            let mut faucet = ts::take_shared<Faucet<QUOTE>>(&scenario);
            let admin = ts::take_from_address<AdminCap>(&scenario, PUBLISHER);
            set_rate<QUOTE>(&admin, &mut faucet, 10_000_000_000, 1);
            ts::return_to_address(PUBLISHER, admin);
            ts::return_shared(faucet);
        };

        ts::next_tx(&mut scenario, USER);
        let mut faucet = ts::take_shared<Faucet<QUOTE>>(&scenario);
        let tiny = mint_quote(&mut scenario, 1);
        return_quote<QUOTE>(&mut faucet, tiny, &clock, ts::ctx(&mut scenario));

        ts::return_shared(faucet);
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = 11, location = faucet)]
    fun test_return_blocks_wallet_that_never_claimed() {
        let mut scenario = ts::begin(PUBLISHER);
        let clock = setup_funded(&mut scenario, 1_000 * 1_000_000);

        // Seed vault with SUI so the only thing protecting it is the eligibility check.
        ts::next_tx(&mut scenario, USER);
        {
            let mut faucet = ts::take_shared<Faucet<QUOTE>>(&scenario);
            let payment = mint_sui(&mut scenario, ONE_SUI_MIST);
            claim<QUOTE>(&mut faucet, payment, &clock, ts::ctx(&mut scenario));
            ts::return_shared(faucet);
        };

        // OTHER never claimed but somehow holds DUSDC. Return must abort.
        ts::next_tx(&mut scenario, OTHER);
        let mut faucet = ts::take_shared<Faucet<QUOTE>>(&scenario);
        let foreign_quote = mint_quote(&mut scenario, HUNDRED_DUSDC_BASE);
        return_quote<QUOTE>(&mut faucet, foreign_quote, &clock, ts::ctx(&mut scenario));

        ts::return_shared(faucet);
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = 12, location = faucet)]
    fun test_return_caps_at_claimed_amount() {
        let mut scenario = ts::begin(PUBLISHER);
        let clock = setup_funded(&mut scenario, 1_000 * 1_000_000);

        // USER claims 100 DUSDC; their ledger sits at 100M base units.
        ts::next_tx(&mut scenario, USER);
        {
            let mut faucet = ts::take_shared<Faucet<QUOTE>>(&scenario);
            let payment = mint_sui(&mut scenario, ONE_SUI_MIST);
            claim<QUOTE>(&mut faucet, payment, &clock, ts::ctx(&mut scenario));
            ts::return_shared(faucet);
        };

        // Attempting to return 200 DUSDC must abort even though USER could mint or buy more elsewhere.
        ts::next_tx(&mut scenario, USER);
        let mut faucet = ts::take_shared<Faucet<QUOTE>>(&scenario);
        let extra = mint_quote(&mut scenario, 2 * HUNDRED_DUSDC_BASE);
        return_quote<QUOTE>(&mut faucet, extra, &clock, ts::ctx(&mut scenario));

        ts::return_shared(faucet);
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    fun test_return_partial_then_remainder() {
        let mut scenario = ts::begin(PUBLISHER);
        let clock = setup_funded(&mut scenario, 1_000 * 1_000_000);

        ts::next_tx(&mut scenario, USER);
        {
            let mut faucet = ts::take_shared<Faucet<QUOTE>>(&scenario);
            let payment = mint_sui(&mut scenario, ONE_SUI_MIST);
            claim<QUOTE>(&mut faucet, payment, &clock, ts::ctx(&mut scenario));
            ts::return_shared(faucet);
        };

        // Return 40 DUSDC. Ledger should drop from 100M to 60M.
        ts::next_tx(&mut scenario, USER);
        {
            let mut faucet = ts::take_shared<Faucet<QUOTE>>(&scenario);
            let part = mint_quote(&mut scenario, 40 * 1_000_000);
            return_quote<QUOTE>(&mut faucet, part, &clock, ts::ctx(&mut scenario));
            ts::return_shared(faucet);
        };

        // Return remaining 60 DUSDC. Should succeed and exhaust the ledger.
        ts::next_tx(&mut scenario, USER);
        {
            let mut faucet = ts::take_shared<Faucet<QUOTE>>(&scenario);
            let part = mint_quote(&mut scenario, 60 * 1_000_000);
            return_quote<QUOTE>(&mut faucet, part, &clock, ts::ctx(&mut scenario));
            assert!(sui_balance<QUOTE>(&faucet) == 0, 600);
            ts::return_shared(faucet);
        };

        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = 7, location = faucet)]
    fun test_return_disabled() {
        let mut scenario = ts::begin(PUBLISHER);
        let clock = setup_funded(&mut scenario, 1_000 * 1_000_000);

        // Disable returns.
        ts::next_tx(&mut scenario, PUBLISHER);
        {
            let mut faucet = ts::take_shared<Faucet<QUOTE>>(&scenario);
            let admin = ts::take_from_address<AdminCap>(&scenario, PUBLISHER);
            set_return_enabled<QUOTE>(&admin, &mut faucet, false);
            ts::return_to_address(PUBLISHER, admin);
            ts::return_shared(faucet);
        };

        ts::next_tx(&mut scenario, USER);
        let mut faucet = ts::take_shared<Faucet<QUOTE>>(&scenario);
        let some_quote = mint_quote(&mut scenario, 100);
        return_quote<QUOTE>(&mut faucet, some_quote, &clock, ts::ctx(&mut scenario));

        ts::return_shared(faucet);
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    fun test_refill_grows_vault() {
        let mut scenario = ts::begin(PUBLISHER);
        let clock = setup_funded(&mut scenario, 1_000 * 1_000_000);

        ts::next_tx(&mut scenario, OTHER);
        let mut faucet = ts::take_shared<Faucet<QUOTE>>(&scenario);
        let topup = mint_quote(&mut scenario, 500 * 1_000_000);
        refill<QUOTE>(&mut faucet, topup, ts::ctx(&mut scenario));
        assert!(quote_balance<QUOTE>(&faucet) == 1_500 * 1_000_000, 400);
        ts::return_shared(faucet);

        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = 1, location = faucet)]
    fun test_paused_blocks_claim() {
        let mut scenario = ts::begin(PUBLISHER);
        let clock = setup_funded(&mut scenario, 1_000 * 1_000_000);

        ts::next_tx(&mut scenario, PUBLISHER);
        {
            let mut faucet = ts::take_shared<Faucet<QUOTE>>(&scenario);
            let admin = ts::take_from_address<AdminCap>(&scenario, PUBLISHER);
            set_paused<QUOTE>(&admin, &mut faucet, true);
            ts::return_to_address(PUBLISHER, admin);
            ts::return_shared(faucet);
        };

        ts::next_tx(&mut scenario, USER);
        let mut faucet = ts::take_shared<Faucet<QUOTE>>(&scenario);
        let payment = mint_sui(&mut scenario, ONE_SUI_MIST);
        claim<QUOTE>(&mut faucet, payment, &clock, ts::ctx(&mut scenario));

        ts::return_shared(faucet);
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = 1, location = faucet)]
    fun test_paused_blocks_return() {
        let mut scenario = ts::begin(PUBLISHER);
        let clock = setup_funded(&mut scenario, 1_000 * 1_000_000);

        ts::next_tx(&mut scenario, PUBLISHER);
        {
            let mut faucet = ts::take_shared<Faucet<QUOTE>>(&scenario);
            let admin = ts::take_from_address<AdminCap>(&scenario, PUBLISHER);
            set_paused<QUOTE>(&admin, &mut faucet, true);
            ts::return_to_address(PUBLISHER, admin);
            ts::return_shared(faucet);
        };

        ts::next_tx(&mut scenario, USER);
        let mut faucet = ts::take_shared<Faucet<QUOTE>>(&scenario);
        let some_quote = mint_quote(&mut scenario, 100);
        return_quote<QUOTE>(&mut faucet, some_quote, &clock, ts::ctx(&mut scenario));

        ts::return_shared(faucet);
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    fun test_paused_allows_refill() {
        let mut scenario = ts::begin(PUBLISHER);
        let clock = setup_funded(&mut scenario, 1_000 * 1_000_000);

        ts::next_tx(&mut scenario, PUBLISHER);
        {
            let mut faucet = ts::take_shared<Faucet<QUOTE>>(&scenario);
            let admin = ts::take_from_address<AdminCap>(&scenario, PUBLISHER);
            set_paused<QUOTE>(&admin, &mut faucet, true);
            ts::return_to_address(PUBLISHER, admin);
            ts::return_shared(faucet);
        };

        ts::next_tx(&mut scenario, OTHER);
        let mut faucet = ts::take_shared<Faucet<QUOTE>>(&scenario);
        let topup = mint_quote(&mut scenario, 200 * 1_000_000);
        refill<QUOTE>(&mut faucet, topup, ts::ctx(&mut scenario));
        assert!(quote_balance<QUOTE>(&faucet) == 1_200 * 1_000_000, 500);
        ts::return_shared(faucet);

        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = 9, location = faucet)]
    fun test_wrong_admin_cap() {
        let mut scenario = ts::begin(PUBLISHER);
        let clock = setup_funded(&mut scenario, 1_000 * 1_000_000);

        // Take faucet A first, then mint a foreign cap by spinning up faucet B in the same tx.
        // admin_b is bound to faucet B's address, so calling set_rate on faucet A must abort.
        ts::next_tx(&mut scenario, PUBLISHER);
        let mut faucet_a = ts::take_shared<Faucet<QUOTE>>(&scenario);
        let (faucet_b, admin_b) = new_for_testing<QUOTE>(ts::ctx(&mut scenario));

        set_rate<QUOTE>(&admin_b, &mut faucet_a, 50, 1);

        test_utils::destroy(admin_b);
        test_utils::destroy(faucet_b);
        ts::return_shared(faucet_a);
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    fun test_recover_quote_happy_path() {
        let mut scenario = ts::begin(PUBLISHER);
        let clock = setup_funded(&mut scenario, 1_000 * 1_000_000);

        // OTHER refills the vault with 500 DUSDC on top of the 1000 seed (1500 total).
        ts::next_tx(&mut scenario, OTHER);
        {
            let mut faucet = ts::take_shared<Faucet<QUOTE>>(&scenario);
            let topup = mint_quote(&mut scenario, 500 * 1_000_000);
            refill<QUOTE>(&mut faucet, topup, ts::ctx(&mut scenario));
            ts::return_shared(faucet);
        };

        // Recovery admin pulls 300 DUSDC out so they can refund OTHER off-chain.
        ts::next_tx(&mut scenario, RECOVERY_ADMIN);
        {
            let mut faucet = ts::take_shared<Faucet<QUOTE>>(&scenario);
            recover_quote<QUOTE>(&mut faucet, 300 * 1_000_000, ts::ctx(&mut scenario));
            assert!(quote_balance<QUOTE>(&faucet) == 1_200 * 1_000_000, 700);
            ts::return_shared(faucet);
        };

        ts::next_tx(&mut scenario, RECOVERY_ADMIN);
        {
            let got = ts::take_from_address<Coin<QUOTE>>(&scenario, RECOVERY_ADMIN);
            assert!(coin::value(&got) == 300 * 1_000_000, 701);
            ts::return_to_address(RECOVERY_ADMIN, got);
        };

        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = 13, location = faucet)]
    fun test_recover_quote_rejects_non_admin() {
        let mut scenario = ts::begin(PUBLISHER);
        let clock = setup_funded(&mut scenario, 1_000 * 1_000_000);

        // PUBLISHER holds the AdminCap, but recover_quote is pinned to RECOVERY_ADMIN's address.
        ts::next_tx(&mut scenario, PUBLISHER);
        let mut faucet = ts::take_shared<Faucet<QUOTE>>(&scenario);
        recover_quote<QUOTE>(&mut faucet, 1, ts::ctx(&mut scenario));

        ts::return_shared(faucet);
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    fun test_recover_sui_happy_path() {
        let mut scenario = ts::begin(PUBLISHER);
        let clock = setup_funded(&mut scenario, 1_000 * 1_000_000);

        // Seed SUI side via a normal claim.
        ts::next_tx(&mut scenario, USER);
        {
            let mut faucet = ts::take_shared<Faucet<QUOTE>>(&scenario);
            let payment = mint_sui(&mut scenario, ONE_SUI_MIST);
            claim<QUOTE>(&mut faucet, payment, &clock, ts::ctx(&mut scenario));
            ts::return_shared(faucet);
        };

        // Recovery admin pulls half of it out.
        ts::next_tx(&mut scenario, RECOVERY_ADMIN);
        {
            let mut faucet = ts::take_shared<Faucet<QUOTE>>(&scenario);
            recover_sui<QUOTE>(&mut faucet, ONE_SUI_MIST / 2, ts::ctx(&mut scenario));
            assert!(sui_balance<QUOTE>(&faucet) == ONE_SUI_MIST / 2, 800);
            ts::return_shared(faucet);
        };

        ts::next_tx(&mut scenario, RECOVERY_ADMIN);
        {
            let got = ts::take_from_address<Coin<SUI>>(&scenario, RECOVERY_ADMIN);
            assert!(coin::value(&got) == ONE_SUI_MIST / 2, 801);
            ts::return_to_address(RECOVERY_ADMIN, got);
        };

        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = 13, location = faucet)]
    fun test_recover_sui_rejects_non_admin() {
        let mut scenario = ts::begin(PUBLISHER);
        let clock = setup_funded(&mut scenario, 1_000 * 1_000_000);

        ts::next_tx(&mut scenario, PUBLISHER);
        let mut faucet = ts::take_shared<Faucet<QUOTE>>(&scenario);
        recover_sui<QUOTE>(&mut faucet, 1, ts::ctx(&mut scenario));

        ts::return_shared(faucet);
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    fun test_emergency_withdraw_all_drains_both_sides() {
        let mut scenario = ts::begin(PUBLISHER);
        let clock = setup_funded(&mut scenario, 1_000 * 1_000_000);

        // Seed SUI side via a claim so both balances are non-zero.
        ts::next_tx(&mut scenario, USER);
        {
            let mut faucet = ts::take_shared<Faucet<QUOTE>>(&scenario);
            let payment = mint_sui(&mut scenario, ONE_SUI_MIST);
            claim<QUOTE>(&mut faucet, payment, &clock, ts::ctx(&mut scenario));
            ts::return_shared(faucet);
        };

        // Quote vault now holds 900 DUSDC (1000 seeded minus 100 served). SUI vault holds 1 SUI.
        ts::next_tx(&mut scenario, RECOVERY_ADMIN);
        {
            let mut faucet = ts::take_shared<Faucet<QUOTE>>(&scenario);
            emergency_withdraw_all<QUOTE>(&mut faucet, ts::ctx(&mut scenario));
            assert!(sui_balance<QUOTE>(&faucet) == 0, 900);
            assert!(quote_balance<QUOTE>(&faucet) == 0, 901);
            ts::return_shared(faucet);
        };

        ts::next_tx(&mut scenario, RECOVERY_ADMIN);
        {
            let sui_got = ts::take_from_address<Coin<SUI>>(&scenario, RECOVERY_ADMIN);
            let quote_got = ts::take_from_address<Coin<QUOTE>>(&scenario, RECOVERY_ADMIN);
            assert!(coin::value(&sui_got) == ONE_SUI_MIST, 902);
            assert!(coin::value(&quote_got) == 900 * 1_000_000, 903);
            ts::return_to_address(RECOVERY_ADMIN, sui_got);
            ts::return_to_address(RECOVERY_ADMIN, quote_got);
        };

        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    fun test_emergency_withdraw_all_handles_empty_side() {
        let mut scenario = ts::begin(PUBLISHER);
        // Vault has 1000 DUSDC seeded but zero SUI since nobody claimed yet.
        let clock = setup_funded(&mut scenario, 1_000 * 1_000_000);

        ts::next_tx(&mut scenario, RECOVERY_ADMIN);
        {
            let mut faucet = ts::take_shared<Faucet<QUOTE>>(&scenario);
            emergency_withdraw_all<QUOTE>(&mut faucet, ts::ctx(&mut scenario));
            assert!(sui_balance<QUOTE>(&faucet) == 0, 910);
            assert!(quote_balance<QUOTE>(&faucet) == 0, 911);
            ts::return_shared(faucet);
        };

        // Only a quote coin should land in recovery admin's inventory.
        ts::next_tx(&mut scenario, RECOVERY_ADMIN);
        {
            let quote_got = ts::take_from_address<Coin<QUOTE>>(&scenario, RECOVERY_ADMIN);
            assert!(coin::value(&quote_got) == 1_000 * 1_000_000, 912);
            ts::return_to_address(RECOVERY_ADMIN, quote_got);
        };

        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = 13, location = faucet)]
    fun test_emergency_withdraw_all_rejects_non_admin() {
        let mut scenario = ts::begin(PUBLISHER);
        let clock = setup_funded(&mut scenario, 1_000 * 1_000_000);

        ts::next_tx(&mut scenario, PUBLISHER);
        let mut faucet = ts::take_shared<Faucet<QUOTE>>(&scenario);
        emergency_withdraw_all<QUOTE>(&mut faucet, ts::ctx(&mut scenario));

        ts::return_shared(faucet);
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = 10, location = faucet)]
    fun test_set_rate_validates() {
        let mut scenario = ts::begin(PUBLISHER);
        let clock = setup_funded(&mut scenario, 1_000 * 1_000_000);

        ts::next_tx(&mut scenario, PUBLISHER);
        let mut faucet = ts::take_shared<Faucet<QUOTE>>(&scenario);
        let admin = ts::take_from_address<AdminCap>(&scenario, PUBLISHER);
        set_rate<QUOTE>(&admin, &mut faucet, 0, 1);

        ts::return_to_address(PUBLISHER, admin);
        ts::return_shared(faucet);
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }
}
