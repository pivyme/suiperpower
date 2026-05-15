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

        ts::next_tx(&mut scenario, USER);
        let mut faucet = ts::take_shared<Faucet<QUOTE>>(&scenario);
        // 1 base unit of DUSDC translates to 1 * 1 * 1000 / 100 = 10 MIST? No: 0.01 MIST -> 0.
        // Actually: quote_in=1, sui_mist_out = 1 * 1 * 1000 / 100 = 10. That's not dust.
        // For dust we need quote_in such that quote_in * 1000 / 100 < 1 => quote_in = 0, but we abort on zero first.
        // Better: set rate to 1/1 (1 DUSDC per 1 SUI base-unit), then 1 quote -> 1 * 1 * 1000 / 1 = 1000 MIST, not dust.
        // Easiest dust path: skew rate so denominator dominates. set_rate(1, 1_000_000) -> sui_out = 1 * 1_000_000 * 1000 / 1 = huge. Wrong direction.
        // We want sui_mist_out=0. Formula: quote_in * den * 1000 / num. Need num >> quote_in * den * 1000.
        // With rate set to (10_000_000_000, 1), quote_in=1: 1 * 1 * 1000 / 10_000_000_000 = 0. Dust.
        let admin = ts::take_from_address<AdminCap>(&scenario, PUBLISHER);
        set_rate<QUOTE>(&admin, &mut faucet, 10_000_000_000, 1);
        ts::return_to_address(PUBLISHER, admin);

        let tiny = mint_quote(&mut scenario, 1);
        return_quote<QUOTE>(&mut faucet, tiny, &clock, ts::ctx(&mut scenario));

        ts::return_shared(faucet);
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
