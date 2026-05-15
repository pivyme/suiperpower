module test_dusdc::test_dusdc {
    use std::option;
    use sui::coin;
    use sui::url;

    /// One-time witness, required by `coin::create_currency`.
    public struct TEST_DUSDC has drop {}

    fun init(witness: TEST_DUSDC, ctx: &mut TxContext) {
        let (treasury, metadata) = coin::create_currency(
            witness,
            6,
            b"DUSDC-TEST",
            b"Test DUSDC",
            b"Rehearsal coin for the DUSDC faucet, not for production use.",
            option::none<url::Url>(),
            ctx,
        );
        // Treasury cap stays with the publisher so they can mint rehearsal liquidity.
        transfer::public_transfer(treasury, tx_context::sender(ctx));
        transfer::public_freeze_object(metadata);
    }
}
