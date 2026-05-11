# Sponsored transaction flow

A sponsored Sui transaction has two signers: the sender (the user, who authorizes the move calls) and the sponsor (who pays gas). The on-chain record shows both.

## Roles

- **Sender**: holds the assets the tx mutates, signs the tx data.
- **Sponsor**: holds SUI for gas, fills `gasData`, signs the tx data.

Both signatures are over the same `TransactionData` bytes. There is no separate "gas only" signature; the sponsor signs the full transaction and trusts the move calls inside.

## High-level flow

```
client builds tx (move calls only, no gas)
       |
       v
client sends tx kind to sponsor server
       |
       v
sponsor server validates (allowlist, rate limit, etc.)
       |
       v
sponsor server fills gasData and signs
       |
       v
sponsor server returns serialized tx + sponsor signature
       |
       v
client signs same bytes
       |
       v
client (or sponsor) submits both signatures
```

## Client: build the tx kind

```ts
import { Transaction } from "@mysten/sui/transactions";

const tx = new Transaction();
tx.moveCall({
  target: `${PACKAGE_ID}::game::claim_starter_pack`,
  arguments: [tx.object(STARTER_REGISTRY)],
});
tx.setSender(userAddress);

const txKindBytes = await tx.build({ client: sui, onlyTransactionKind: true });
const txKindBase64 = btoa(String.fromCharCode(...txKindBytes));
```

The kind is the move-call portion without gas. The sponsor fills gas in.

## Server: validate, fill gas, sign

```ts
import { Transaction } from "@mysten/sui/transactions";
import { fromB64, toB64 } from "@mysten/sui/utils";

export async function sponsorTx(req: { txKind: string; sender: string }) {
  // 1. Validate. See sponsor-allowlist.md and sponsor-pitfalls.md.
  await assertAllowlist(req.txKind);
  await assertRateLimit(req.sender);

  // 2. Reconstruct tx
  const tx = Transaction.fromKind(fromB64(req.txKind));
  tx.setSender(req.sender);

  // 3. Set gas
  const sponsorGasCoins = await sui.getCoins({ owner: SPONSOR_ADDRESS });
  tx.setGasOwner(SPONSOR_ADDRESS);
  tx.setGasPayment(
    sponsorGasCoins.data.slice(0, 1).map((c) => ({
      objectId: c.coinObjectId,
      version: c.version,
      digest: c.digest,
    })),
  );
  tx.setGasBudget(50_000_000n); // ~0.05 SUI

  // 4. Sponsor signs
  const txBytes = await tx.build({ client: sui });
  const sponsorSig = await sponsorKeypair.signTransaction(txBytes);

  return {
    txBytes: toB64(txBytes),
    sponsorSig: sponsorSig.signature,
  };
}
```

## Client: sign and submit

```ts
const { txBytes, sponsorSig } = await callSponsorAPI(txKindBase64, userAddress);

const userSig = await userSigner.signTransaction(fromB64(txBytes));

const result = await sui.executeTransaction({
  transaction: txBytes,
  signatures: [sponsorSig, userSig.signature],
  options: { showEffects: true },
});

console.log("digest:", result.digest);
```

Either the client or the server can call `executeTransaction`; the signatures are the same either way.

## Inspecting on chain

The on-chain transaction record shows:

- `transaction.data.sender`: user address
- `transaction.data.gasData.owner`: sponsor address
- `transaction.data.gasData.payment`: sponsor's gas coins

Both addresses are visible. There is no way to hide the sponsor.

## Mysten gas station / third-party

Both expose an API similar to the server flow above. They handle:

- Sponsor key custody.
- Rate limiting.
- Allowlists (often per-app config).
- Sponsor balance top-up.

For first integration, use a third-party. Move to self-hosted only if cost or policy demands.

Last updated: 2026-05-11.
