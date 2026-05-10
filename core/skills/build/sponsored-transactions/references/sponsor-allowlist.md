# Sponsor allowlist patterns

The sponsor's job is to refuse anything outside scope. Define scope concretely.

## Allowlist by package + function

The simplest, highest-confidence allowlist:

```ts
const ALLOWED = new Map<string, Set<string>>([
  [PACKAGE_ID_GAME, new Set(["game::claim_starter_pack", "profile::create"])],
  [PACKAGE_ID_NFT, new Set(["mint::free_drop"])],
]);

function inspectAndAllow(txKindBytes: Uint8Array): boolean {
  const tx = Transaction.fromKind(txKindBytes);
  const calls = tx.getData().transactions;
  for (const c of calls) {
    if (c.kind !== "MoveCall") return false; // no transfers, no merges, etc.
    const allowed = ALLOWED.get(c.target.split("::")[0])?.has(
      c.target.split("::").slice(1).join("::"),
    );
    if (!allowed) return false;
  }
  return true;
}
```

Reject the tx if it contains anything other than allowlisted calls.

## Reject value-leaking patterns

Even within allowlisted functions, refuse:

- `splitCoins` that send to arbitrary addresses.
- `transferObjects` that move sponsor-owned Objects.
- `mergeCoins` that consume gas coins outside the sponsor's pool.

Strict rule: the sponsor only signs txs whose move calls are on the allowlist and whose other commands are no-ops or read-only constructions.

## Per-user budget

```ts
const userBudgets = new Map<string, { used: bigint; resetAt: number }>();

function checkBudget(user: string, gasBudget: bigint): boolean {
  const entry = userBudgets.get(user) ?? { used: 0n, resetAt: nextDay() };
  if (Date.now() > entry.resetAt) {
    entry.used = 0n;
    entry.resetAt = nextDay();
  }
  if (entry.used + gasBudget > MAX_DAILY_GAS_PER_USER) return false;
  entry.used += gasBudget;
  userBudgets.set(user, entry);
  return true;
}
```

For real production, use a persistent store (Redis, Postgres). The in-memory map above is illustrative.

## Per-IP and per-session limits

In addition to per-user, rate-limit per IP and per session token. Multi-account abuse and Sybil patterns get caught here.

## Tx shape sanity

```ts
function shapeOk(txKindBytes: Uint8Array): boolean {
  const tx = Transaction.fromKind(txKindBytes);
  const data = tx.getData();
  if (data.transactions.length > MAX_COMMANDS) return false;
  if (data.inputs.length > MAX_INPUTS) return false;
  return true;
}
```

Cap command count and input count. A 200-command PTB might be legitimate, but if your allowlisted functions never produce more than 5 commands, anything more is suspicious.

## Network binding

```ts
if (process.env.SUI_NETWORK !== EXPECTED_NETWORK) {
  throw new Error("network mismatch in sponsor service");
}
```

Surface a startup error; do not let testnet sponsor key sign a mainnet tx because of a misconfigured env var.

## Audit trail

Log every sponsor-signed tx:

- Timestamp.
- User identifier.
- Tx digest.
- Gas budget used.
- Move calls invoked.

When the sponsor balance drops faster than expected, the log shows where it went. Without the log, you are guessing.

Retain logs at least 30 days; for production with non-trivial sponsor budget, longer.

## Dry-run before sign

For high-stakes sponsoring, dry-run the tx before signing:

```ts
const dryRun = await sui.dryRunTransactionBlock({ transactionBlock: txBytes });
if (dryRun.effects.status.status !== "success") {
  throw new Error("dry run failed: " + dryRun.effects.status.error);
}
```

This catches user-griefing patterns (txs that always abort and waste sponsor gas).

Trade-off: extra latency per request. For high-value sponsors, worth it.

Last updated: 2026-05-10.
