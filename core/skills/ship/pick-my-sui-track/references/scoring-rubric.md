# Scoring rubric per sponsor

Evidence-based scoring. The score is a claim about the codebase, not about intent.

## Walrus

- 0: no `walrus` imports, no SDK calls, no blob ids in the project.
- 1: a `walrus` reference in a README or `Move.toml`, but no calls.
- 2: at least one store or read call exists, but the demo would still work without it (e.g. images served from a CDN with Walrus as a fallback).
- 3: a stored blob is retrieved and rendered in the user-visible demo flow. Removing Walrus breaks the demo.

## DeepBook

- 0: no DeepBook imports, no SDK calls.
- 1: a DeepBook reference in docs, no calls.
- 2: an order is placed but never settled in the demo, or DeepBook is used for read-only price discovery.
- 3: at least one real testnet order is placed and settled in the demo, and the project's value depends on it.

## OpenZeppelin

- 0: no OZ Sui modules used.
- 1: OZ in `Move.toml` but every call is hand-rolled instead.
- 2: one OZ module used, but for a non-load-bearing path (e.g. an admin-only function).
- 3: at least one OZ module replaces what would otherwise be hand-rolled critical logic (capabilities, access control, upgrade safety).

## OtterSec

- 0: no security review evidence, no OtterSec checklist run.
- 1: the checklist file is referenced but no items are completed.
- 2: some checklist items are completed, but P0 items remain open.
- 3: every P0 item from the OtterSec checklist has a recorded answer (resolved or accepted-risk with rationale).

## Scallop

- 0: no Scallop imports.
- 1: Scallop in `Move.toml` or docs, no calls.
- 2: a deposit or borrow call exists in code, but is not exercised in the demo.
- 3: deposit, borrow, and repay are exercised against a live Scallop pool in the demo.

## How to assign a score

For each sponsor, do all three:

1. Search the codebase for the SDK or Move package import.
2. Find every call site.
3. Walk the demo end to end. If the call is on the demo path, the score may be 3. If the call exists but the demo would still complete with it removed, the score is 2.

When in doubt, score lower. The cost of overstating a score is a track recommendation that does not match the project, which judges will see immediately.
