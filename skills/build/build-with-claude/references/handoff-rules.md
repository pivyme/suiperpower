# When to hand off

`build-with-claude` is the loop. Specialist skills are the work. Handoff at the right moment.

## Hand off to `build-with-move` when

- The slice involves authoring or modifying Move code.
- The user is stuck on a Move compile error.
- A capability or object decision needs concrete code.

Bring back: the resulting Move module(s), tests, and any updates to `Move.toml`.

## Hand off to `ptb-composer` when

- The slice involves a multi-step client transaction.
- Atomicity across Move calls matters.
- Sponsoring a multi-step flow.

Bring back: the working PTB code, dry-run output, settled testnet digest.

## Hand off to `object-model-design` when

- The slice introduces new Objects that have not been designed.
- An existing design has proven painful and needs revision.
- A new capability is being added and the holder strategy is undecided.

Bring back: the updated Object map and capability map in `build-context.md`.

## Hand off to a sponsor skill when

- The slice integrates Walrus, DeepBook, Scallop, OpenZeppelin Sui, or zkLogin.
- Refer to `walrus-storage`, `deepbook-orderbook`, `scallop-money-market`, `openzeppelin-sui-libs`, `sui-zk-login`.

Bring back: the integration code, live demo digest, and any new dependencies.

## Hand off to `debug-move` when

- A Move package fails to compile and the error is non-obvious.
- A runtime failure (abort) needs root-cause analysis.

Bring back: the fix, plus a regression test that covers the failure mode.

## Hand off to `review-move` when

- The slice is at a meaningful boundary (end of a major feature, before deploy).
- The user wants a P0-P3 walk before continuing.

Bring back: the findings list and applied fixes.

## Hand off to anti-slop skills

When the slice is a "ship readiness" check, hand off to:

- `validate-business-model`: at MVP completion, before scope creep.
- `retention-loop`: before launch.
- `will-real-users-pay`: before pricing decisions.
- `roast-my-product`: before sharing publicly.
- `product-review`: as the final UX pass.

Bring back: the findings as committed entries in `build-context.md`, with a list of fixes scheduled.

## Hand off to ship skills

- `deploy-to-testnet`: when the package is ready for first deploy.
- `deploy-to-mainnet`: only after `validate-business-model`, `retention-loop`, and `review-move` are clean.
- `pick-my-sui-track`: before submitting to Sui Overflow.
- `submit-to-sui-overflow`: at submission time.

## Do not hand off when

- The slice is small enough that a specialist skill would overhead-dominate the work.
- The user is mid-thought and switching contexts would lose the thread.
- The handoff target requires inputs the user has not provided yet.

In those cases, do the work in `build-with-claude` and pull in references manually.

## Returning from a handoff

When a specialist skill returns, do these steps:

1. Confirm the specialist's quality gate passed.
2. Integrate the change into the slice.
3. Run the slice's own quality gate again (build, tests).
4. Update `build-context.md`.
5. Continue to the next step in the slice or close out.

Last updated: 2026-05-10.
