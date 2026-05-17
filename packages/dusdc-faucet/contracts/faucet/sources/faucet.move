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
    const E_NOT_ELIGIBLE_TO_RETURN: u64 = 11;
    const E_OVER_RETURN_LIMIT: u64 = 12;
    const E_NOT_RECOVERY_ADMIN: u64 = 13;

    /// Recovery admin. Hardcoded to the publisher wallet (derived from backend/.env PRIVATE_KEY)
    /// so the recovery escape hatch stays bound to a wallet whose key the backend already holds.
    /// Used to refund users whose donated quote exceeds their claim ledger and therefore can no
    /// longer be returned on-chain.
    const RECOVERY_ADMIN: address =
        @0x3935bbb26c147851285c0fd76c712e5ccc7669908c2327a1301db52563b12e71;

    /// Shared faucet object. Holds SUI and quote-coin liquidity plus the rate, caps, and per-wallet ledger.
    /// Generic over T, the quote coin type. Publish once with test DUSDC for rehearsal, again with real DUSDC.
    public struct Faucet<phantom T> has key {
        id: UID,
        sui_balance: Balance<SUI>,
        quote_balance: Balance<T>,
        rate_numerator: u64,
        rate_denominator: u64,
        per_tx_sui_cap_mist: u64,
        per_wallet_daily_sui_cap_mist: u64,
        usage: Table<address, WalletRecord>,
        paused: bool,
        return_enabled: bool,
        total_served_quote: u64,
        total_claims: u64,
    }

    /// Per-wallet state. `consumed_sui_mist` resets each UTC day; `claimed_quote_net` is the
    /// running ledger of quote received via claim minus quote already returned. Returns are
    /// capped at this ledger so a wallet that never claimed cannot drain SUI by dumping quote
    /// acquired elsewhere.
    public struct WalletRecord has store, copy, drop {
        utc_day: u64,
        consumed_sui_mist: u64,
        claimed_quote_net: u64,
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

    public struct QuoteRecovered has copy, drop {
        admin: address,
        amount: u64,
        new_quote_balance: u64,
    }

    public struct SuiRecovered has copy, drop {
        admin: address,
        amount_mist: u64,
        new_sui_balance: u64,
    }

    public struct EmergencyDrained has copy, drop {
        admin: address,
        sui_mist_out: u64,
        quote_out: u64,
    }

    // Init the faucet at deploy time. Publisher calls this, receives the AdminCap, shares the Faucet.
    public entry fun create_faucet<T>(ctx: &mut TxContext) {
        let id = object::new(ctx);
        let faucet_addr = object::uid_to_address(&id);

        let faucet = Faucet<T> {
            id,
            sui_balance: balance::zero<SUI>(),
            quote_balance: balance::zero<T>(),
            rate_numerator: 1,
            rate_denominator: 1,
            per_tx_sui_cap_mist: 1_000_000_000,
            per_wallet_daily_sui_cap_mist: 5_000_000_000,
            usage: table::new<address, WalletRecord>(ctx),
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

        // SUI 9 decimals -> DUSDC 6 decimals. base_quote = mist * num / (den * 1000).
        // With default num=1 den=1, that is 1 SUI in -> 1 DUSDC out.
        let quote_out_u128 = (sui_in as u128)
            * (faucet.rate_numerator as u128)
            / ((faucet.rate_denominator as u128) * 1000);
        let quote_out = quote_out_u128 as u64;

        assert!(quote_out > 0, E_ZERO_AMOUNT);
        assert!(balance::value(&faucet.quote_balance) >= quote_out, E_INSUFFICIENT_VAULT_QUOTE);

        // Update wallet ledger before moving any coins.
        if (table::contains(&faucet.usage, wallet)) {
            let prior = table::borrow_mut(&mut faucet.usage, wallet);
            if (prior.utc_day != today) {
                prior.utc_day = today;
                prior.consumed_sui_mist = 0;
            };
            prior.consumed_sui_mist = prior.consumed_sui_mist + sui_in;
            assert!(prior.consumed_sui_mist <= faucet.per_wallet_daily_sui_cap_mist, E_OVER_DAILY_WALLET_CAP);
            prior.claimed_quote_net = prior.claimed_quote_net + quote_out;
        } else {
            assert!(sui_in <= faucet.per_wallet_daily_sui_cap_mist, E_OVER_DAILY_WALLET_CAP);
            let record = WalletRecord {
                utc_day: today,
                consumed_sui_mist: sui_in,
                claimed_quote_net: quote_out,
            };
            table::add(&mut faucet.usage, wallet, record);
        };

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

    // Trade quote back for SUI at the same rate. Capped at the wallet's net claim ledger so a
    // wallet that never claimed (or one that bought quote elsewhere) cannot drain the SUI vault.
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

        let wallet = tx_context::sender(ctx);
        assert!(table::contains(&faucet.usage, wallet), E_NOT_ELIGIBLE_TO_RETURN);
        let record = table::borrow_mut(&mut faucet.usage, wallet);
        assert!(record.claimed_quote_net >= quote_in, E_OVER_RETURN_LIMIT);

        let sui_mist_out_u128 = (quote_in as u128)
            * (faucet.rate_denominator as u128)
            * 1000u128
            / (faucet.rate_numerator as u128);
        let sui_mist_out = sui_mist_out_u128 as u64;

        assert!(sui_mist_out > 0, E_DUST_RETURN);
        assert!(balance::value(&faucet.sui_balance) >= sui_mist_out, E_INSUFFICIENT_VAULT_SUI);

        record.claimed_quote_net = record.claimed_quote_net - quote_in;

        let quote_in_balance = coin::into_balance(payment);
        balance::join(&mut faucet.quote_balance, quote_in_balance);

        let payout_balance = balance::split(&mut faucet.sui_balance, sui_mist_out);
        let payout_coin = coin::from_balance(payout_balance, ctx);
        transfer::public_transfer(payout_coin, wallet);

        event::emit(Returned {
            wallet,
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

    /// Recovery escape hatch for quote. Pulls a specific amount of donated/excess quote so we
    /// can refund users off-chain when their tokens are stuck above their return ledger. Gated
    /// to `RECOVERY_ADMIN` only, independent of AdminCap ownership.
    public entry fun recover_quote<T>(
        faucet: &mut Faucet<T>,
        amount: u64,
        ctx: &mut TxContext,
    ) {
        let sender = tx_context::sender(ctx);
        assert!(sender == RECOVERY_ADMIN, E_NOT_RECOVERY_ADMIN);
        assert!(amount > 0, E_ZERO_AMOUNT);

        let bal = balance::split(&mut faucet.quote_balance, amount);
        let c = coin::from_balance(bal, ctx);
        transfer::public_transfer(c, sender);

        event::emit(QuoteRecovered {
            admin: sender,
            amount,
            new_quote_balance: balance::value(&faucet.quote_balance),
        });
    }

    /// Recovery escape hatch for SUI. Mirror of `recover_quote` for the SUI side of the vault.
    public entry fun recover_sui<T>(
        faucet: &mut Faucet<T>,
        amount_mist: u64,
        ctx: &mut TxContext,
    ) {
        let sender = tx_context::sender(ctx);
        assert!(sender == RECOVERY_ADMIN, E_NOT_RECOVERY_ADMIN);
        assert!(amount_mist > 0, E_ZERO_AMOUNT);

        let bal = balance::split(&mut faucet.sui_balance, amount_mist);
        let c = coin::from_balance(bal, ctx);
        transfer::public_transfer(c, sender);

        event::emit(SuiRecovered {
            admin: sender,
            amount_mist,
            new_sui_balance: balance::value(&faucet.sui_balance),
        });
    }

    /// Emergency drain. Empties both SUI and quote balances in one tx and transfers them to the
    /// recovery admin. Use only if something is wrong with the faucet and we need everything out
    /// fast. Does not pause; combine with `set_paused(true)` beforehand if you also want to stop
    /// concurrent claims/returns from racing in the same transaction batch.
    public entry fun emergency_withdraw_all<T>(
        faucet: &mut Faucet<T>,
        ctx: &mut TxContext,
    ) {
        let sender = tx_context::sender(ctx);
        assert!(sender == RECOVERY_ADMIN, E_NOT_RECOVERY_ADMIN);

        let sui_bal = balance::withdraw_all(&mut faucet.sui_balance);
        let sui_amount = balance::value(&sui_bal);
        if (sui_amount > 0) {
            let c = coin::from_balance(sui_bal, ctx);
            transfer::public_transfer(c, sender);
        } else {
            balance::destroy_zero(sui_bal);
        };

        let quote_bal = balance::withdraw_all(&mut faucet.quote_balance);
        let quote_amount = balance::value(&quote_bal);
        if (quote_amount > 0) {
            let c = coin::from_balance(quote_bal, ctx);
            transfer::public_transfer(c, sender);
        } else {
            balance::destroy_zero(quote_bal);
        };

        event::emit(EmergencyDrained {
            admin: sender,
            sui_mist_out: sui_amount,
            quote_out: quote_amount,
        });
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

    /// How much quote the given wallet may still return. Zero if the wallet has never claimed.
    public fun wallet_return_capacity<T>(f: &Faucet<T>, wallet: address): u64 {
        if (table::contains(&f.usage, wallet)) {
            let r = table::borrow(&f.usage, wallet);
            r.claimed_quote_net
        } else {
            0
        }
    }

    // Test-only helpers, never compiled into prod artifacts.
    #[test_only]
    public fun new_for_testing<T>(ctx: &mut TxContext): (Faucet<T>, AdminCap) {
        let id = object::new(ctx);
        let faucet_addr = object::uid_to_address(&id);
        let faucet = Faucet<T> {
            id,
            sui_balance: balance::zero<SUI>(),
            quote_balance: balance::zero<T>(),
            rate_numerator: 1,
            rate_denominator: 1,
            per_tx_sui_cap_mist: 1_000_000_000,
            per_wallet_daily_sui_cap_mist: 5_000_000_000,
            usage: table::new<address, WalletRecord>(ctx),
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
