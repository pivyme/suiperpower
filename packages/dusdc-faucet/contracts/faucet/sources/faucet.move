module faucet::faucet {
    use sui::balance::{Self, Balance};
    use sui::clock::{Self, Clock};
    use sui::coin::{Self, Coin};
    use sui::event;
    use sui::sui::SUI;
    use sui::table::{Self, Table};

    // Error codes
    const E_PAUSED: u64 = 1;
    const E_OVER_PER_TX_CAP: u64 = 2;
    const E_OVER_DAILY_WALLET_CAP: u64 = 3;
    const E_INSUFFICIENT_VAULT_QUOTE: u64 = 4;
    const E_INSUFFICIENT_VAULT_SUI: u64 = 5;
    const E_ZERO_AMOUNT: u64 = 6;
    const E_RETURN_DISABLED: u64 = 7;
    const E_DUST_RETURN: u64 = 8;
    const E_WRONG_ADMIN_CAP: u64 = 9;
    const E_BAD_RATE: u64 = 10;

    /// Shared faucet object. Holds SUI and quote-coin liquidity plus the rate, caps, and daily usage.
    /// Generic over T, the quote coin type. Publish once with test DUSDC for rehearsal, again with real DUSDC.
    public struct Faucet<phantom T> has key {
        id: UID,
        sui_balance: Balance<SUI>,
        quote_balance: Balance<T>,
        rate_numerator: u64,
        rate_denominator: u64,
        per_tx_sui_cap_mist: u64,
        per_wallet_daily_sui_cap_mist: u64,
        usage: Table<address, DailyUsage>,
        paused: bool,
        return_enabled: bool,
        total_served_quote: u64,
        total_claims: u64,
    }

    public struct DailyUsage has store, copy, drop {
        utc_day: u64,
        consumed_sui_mist: u64,
    }

    /// Owned cap. Bound to a single Faucet via object id so a stolen cap cannot control other deployments.
    public struct AdminCap has key, store {
        id: UID,
        faucet_id: address,
    }

    // Events

    public struct Claimed has copy, drop {
        wallet: address,
        sui_mist_in: u64,
        quote_out: u64,
        rate_numerator: u64,
        rate_denominator: u64,
        utc_day: u64,
        total_served_quote: u64,
        total_claims: u64,
    }

    public struct Returned has copy, drop {
        wallet: address,
        quote_in: u64,
        sui_mist_out: u64,
        rate_numerator: u64,
        rate_denominator: u64,
    }

    public struct Refilled has copy, drop {
        from: address,
        quote_in: u64,
        new_quote_balance: u64,
    }

    public struct AdminAction has copy, drop {
        field: vector<u8>,
        new_value_u64: u64,
        new_value_bool: bool,
    }

    // Init the faucet at deploy time. Publisher calls this, receives the AdminCap, shares the Faucet.
    public entry fun create_faucet<T>(ctx: &mut TxContext) {
        let id = object::new(ctx);
        let faucet_addr = object::uid_to_address(&id);

        let faucet = Faucet<T> {
            id,
            sui_balance: balance::zero<SUI>(),
            quote_balance: balance::zero<T>(),
            rate_numerator: 100,
            rate_denominator: 1,
            per_tx_sui_cap_mist: 1_000_000_000,
            per_wallet_daily_sui_cap_mist: 5_000_000_000,
            usage: table::new<address, DailyUsage>(ctx),
            paused: false,
            return_enabled: true,
            total_served_quote: 0,
            total_claims: 0,
        };

        let admin = AdminCap { id: object::new(ctx), faucet_id: faucet_addr };
        transfer::public_transfer(admin, tx_context::sender(ctx));
        transfer::share_object(faucet);
    }

    // Trade SUI for quote at the configured rate. Daily reset is per-UTC-day per wallet.
    public entry fun claim<T>(
        faucet: &mut Faucet<T>,
        payment: Coin<SUI>,
        clock: &Clock,
        ctx: &mut TxContext,
    ) {
        assert!(!faucet.paused, E_PAUSED);

        let sui_in = coin::value(&payment);
        assert!(sui_in > 0, E_ZERO_AMOUNT);
        assert!(sui_in <= faucet.per_tx_sui_cap_mist, E_OVER_PER_TX_CAP);

        let wallet = tx_context::sender(ctx);
        let today = clock::timestamp_ms(clock) / 86_400_000;

        // Update usage before moving any coins.
        if (table::contains(&faucet.usage, wallet)) {
            let prior = table::borrow_mut(&mut faucet.usage, wallet);
            if (prior.utc_day != today) {
                prior.utc_day = today;
                prior.consumed_sui_mist = 0;
            };
            prior.consumed_sui_mist = prior.consumed_sui_mist + sui_in;
            assert!(prior.consumed_sui_mist <= faucet.per_wallet_daily_sui_cap_mist, E_OVER_DAILY_WALLET_CAP);
        } else {
            assert!(sui_in <= faucet.per_wallet_daily_sui_cap_mist, E_OVER_DAILY_WALLET_CAP);
            let usage = DailyUsage { utc_day: today, consumed_sui_mist: sui_in };
            table::add(&mut faucet.usage, wallet, usage);
        };

        // SUI 9 decimals -> DUSDC 6 decimals. base_quote = mist * num / (den * 1000).
        let quote_out_u128 = (sui_in as u128)
            * (faucet.rate_numerator as u128)
            / ((faucet.rate_denominator as u128) * 1000);
        let quote_out = quote_out_u128 as u64;

        assert!(quote_out > 0, E_ZERO_AMOUNT);
        assert!(balance::value(&faucet.quote_balance) >= quote_out, E_INSUFFICIENT_VAULT_QUOTE);

        let sui_in_balance = coin::into_balance(payment);
        balance::join(&mut faucet.sui_balance, sui_in_balance);

        let payout_balance = balance::split(&mut faucet.quote_balance, quote_out);
        let payout_coin = coin::from_balance(payout_balance, ctx);
        transfer::public_transfer(payout_coin, wallet);

        faucet.total_served_quote = faucet.total_served_quote + quote_out;
        faucet.total_claims = faucet.total_claims + 1;

        event::emit(Claimed {
            wallet,
            sui_mist_in: sui_in,
            quote_out,
            rate_numerator: faucet.rate_numerator,
            rate_denominator: faucet.rate_denominator,
            utc_day: today,
            total_served_quote: faucet.total_served_quote,
            total_claims: faucet.total_claims,
        });
    }

    // Trade quote back for SUI at the same rate. Dust-protected.
    public entry fun return_quote<T>(
        faucet: &mut Faucet<T>,
        payment: Coin<T>,
        _clock: &Clock,
        ctx: &mut TxContext,
    ) {
        assert!(!faucet.paused, E_PAUSED);
        assert!(faucet.return_enabled, E_RETURN_DISABLED);

        let quote_in = coin::value(&payment);
        assert!(quote_in > 0, E_ZERO_AMOUNT);

        let sui_mist_out_u128 = (quote_in as u128)
            * (faucet.rate_denominator as u128)
            * 1000u128
            / (faucet.rate_numerator as u128);
        let sui_mist_out = sui_mist_out_u128 as u64;

        assert!(sui_mist_out > 0, E_DUST_RETURN);
        assert!(balance::value(&faucet.sui_balance) >= sui_mist_out, E_INSUFFICIENT_VAULT_SUI);

        let quote_in_balance = coin::into_balance(payment);
        balance::join(&mut faucet.quote_balance, quote_in_balance);

        let payout_balance = balance::split(&mut faucet.sui_balance, sui_mist_out);
        let payout_coin = coin::from_balance(payout_balance, ctx);
        transfer::public_transfer(payout_coin, tx_context::sender(ctx));

        event::emit(Returned {
            wallet: tx_context::sender(ctx),
            quote_in,
            sui_mist_out,
            rate_numerator: faucet.rate_numerator,
            rate_denominator: faucet.rate_denominator,
        });
    }

    // Permissionless top-up. Anyone can deposit quote into the vault.
    public entry fun refill<T>(
        faucet: &mut Faucet<T>,
        deposit: Coin<T>,
        ctx: &mut TxContext,
    ) {
        let quote_in = coin::value(&deposit);
        assert!(quote_in > 0, E_ZERO_AMOUNT);

        let in_balance = coin::into_balance(deposit);
        balance::join(&mut faucet.quote_balance, in_balance);

        event::emit(Refilled {
            from: tx_context::sender(ctx),
            quote_in,
            new_quote_balance: balance::value(&faucet.quote_balance),
        });
    }

    // Admin functions. Every one asserts cap binding via faucet_id == object::uid_to_address(&faucet.id).

    public entry fun set_rate<T>(
        cap: &AdminCap,
        faucet: &mut Faucet<T>,
        num: u64,
        den: u64,
    ) {
        assert!(cap.faucet_id == object::uid_to_address(&faucet.id), E_WRONG_ADMIN_CAP);
        assert!(num > 0 && den > 0, E_BAD_RATE);
        faucet.rate_numerator = num;
        faucet.rate_denominator = den;
        event::emit(AdminAction { field: b"rate", new_value_u64: num, new_value_bool: false });
    }

    public entry fun set_per_tx_cap<T>(cap: &AdminCap, faucet: &mut Faucet<T>, mist: u64) {
        assert!(cap.faucet_id == object::uid_to_address(&faucet.id), E_WRONG_ADMIN_CAP);
        faucet.per_tx_sui_cap_mist = mist;
        event::emit(AdminAction { field: b"per_tx_cap", new_value_u64: mist, new_value_bool: false });
    }

    public entry fun set_daily_cap<T>(cap: &AdminCap, faucet: &mut Faucet<T>, mist: u64) {
        assert!(cap.faucet_id == object::uid_to_address(&faucet.id), E_WRONG_ADMIN_CAP);
        faucet.per_wallet_daily_sui_cap_mist = mist;
        event::emit(AdminAction { field: b"daily_cap", new_value_u64: mist, new_value_bool: false });
    }

    public entry fun set_paused<T>(cap: &AdminCap, faucet: &mut Faucet<T>, paused: bool) {
        assert!(cap.faucet_id == object::uid_to_address(&faucet.id), E_WRONG_ADMIN_CAP);
        faucet.paused = paused;
        event::emit(AdminAction { field: b"paused", new_value_u64: 0, new_value_bool: paused });
    }

    public entry fun set_return_enabled<T>(cap: &AdminCap, faucet: &mut Faucet<T>, enabled: bool) {
        assert!(cap.faucet_id == object::uid_to_address(&faucet.id), E_WRONG_ADMIN_CAP);
        faucet.return_enabled = enabled;
        event::emit(AdminAction { field: b"return_enabled", new_value_u64: 0, new_value_bool: enabled });
    }

    public entry fun withdraw_sui<T>(
        cap: &AdminCap,
        faucet: &mut Faucet<T>,
        amount_mist: u64,
        ctx: &mut TxContext,
    ) {
        assert!(cap.faucet_id == object::uid_to_address(&faucet.id), E_WRONG_ADMIN_CAP);
        let bal = balance::split(&mut faucet.sui_balance, amount_mist);
        let c = coin::from_balance(bal, ctx);
        transfer::public_transfer(c, tx_context::sender(ctx));
    }

    public entry fun transfer_admin(cap: AdminCap, recipient: address) {
        transfer::public_transfer(cap, recipient);
    }

    // Read helpers, consumed by frontend and indexers via parsed object fields or dev-inspect.

    public fun quote_balance<T>(f: &Faucet<T>): u64 { balance::value(&f.quote_balance) }
    public fun sui_balance<T>(f: &Faucet<T>): u64 { balance::value(&f.sui_balance) }
    public fun rate<T>(f: &Faucet<T>): (u64, u64) { (f.rate_numerator, f.rate_denominator) }
    public fun is_paused<T>(f: &Faucet<T>): bool { f.paused }
    public fun return_enabled<T>(f: &Faucet<T>): bool { f.return_enabled }
    public fun total_served_quote<T>(f: &Faucet<T>): u64 { f.total_served_quote }
    public fun total_claims<T>(f: &Faucet<T>): u64 { f.total_claims }

    // Test-only helpers, never compiled into prod artifacts.
    #[test_only]
    public fun new_for_testing<T>(ctx: &mut TxContext): (Faucet<T>, AdminCap) {
        let id = object::new(ctx);
        let faucet_addr = object::uid_to_address(&id);
        let faucet = Faucet<T> {
            id,
            sui_balance: balance::zero<SUI>(),
            quote_balance: balance::zero<T>(),
            rate_numerator: 100,
            rate_denominator: 1,
            per_tx_sui_cap_mist: 1_000_000_000,
            per_wallet_daily_sui_cap_mist: 5_000_000_000,
            usage: table::new<address, DailyUsage>(ctx),
            paused: false,
            return_enabled: true,
            total_served_quote: 0,
            total_claims: 0,
        };
        let admin = AdminCap { id: object::new(ctx), faucet_id: faucet_addr };
        (faucet, admin)
    }

    #[test_only]
    public fun admin_faucet_id(cap: &AdminCap): address { cap.faucet_id }

    #[test_only]
    public fun share_for_testing<T>(faucet: Faucet<T>) {
        transfer::share_object(faucet);
    }
}
