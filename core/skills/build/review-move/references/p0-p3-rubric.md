# P0 to P3 severity rubric (Sui Move)

The point of severity bands is shared vocabulary with users and auditors. Use these definitions consistently across reviews.

## P0, must fix before deploy

A working exploit path that lets a caller (any external address, in most cases) cause:

- Fund loss for users or the protocol.
- Unauthorized minting or burning of coins or NFTs.
- Capability escape (e.g. `AdminCap`, `TreasuryCap`, `UpgradeCap`) into untrusted hands.
- State mutation that breaks a load-bearing invariant (supply conservation, ownership exclusivity, total-supply cap).

P0 findings block any deploy, testnet or mainnet. The skill will not pass them through.

Examples:

- A `public` mint function that takes the cap by value, allowing the caller to keep it.
- A withdrawal function that does not check the caller is the depositor.
- An `init` function that can be called outside publish.
- Reentrancy on a shared Object that lets a single PTB drain a vault.

## P1, high

A real problem that does not yet have a published exploit, or requires a specific (but plausible) caller condition.

- Denial of service against a single user or a small set.
- Broken invariants under non-default but reachable conditions (e.g. integer overflow at large but plausible inputs).
- Capability concentration without recovery (cap held in a single EOA with no multisig).
- Missing slippage or oracle staleness checks on swap or borrow paths.
- Bypassable pause / freeze logic.

P1 findings should be fixed before mainnet. Testnet may proceed if the finding is documented.

## P2, medium

Code-quality issues that hide bugs but are not directly exploitable today.

- A public function should be `public(package)`.
- An entry function lacks a unit test.
- An assertion uses a magic number instead of a named error constant.
- Mixed `&` and `&mut` patterns that confuse callers.
- Missing `#[expected_failure(abort_code = ...)]` on tests that depend on aborts.

P2 should be fixed eventually. Backlog them, do not block deploy.

## P3, low / informational

Style, dead code, missing comments.

- Unused imports.
- Inconsistent naming (`E_NOT_AUTH` vs `ENotAuthorized`).
- Comments that explain WHAT instead of WHY.
- Dead branches.
- Outdated TODOs.

P3 are nice to clean up but never gate a deploy.

## Triage rules

- If unsure between P0 and P1, default to P0. The cost of false-P0 is one extra fix; the cost of false-P1 is potential exploit.
- If unsure between P1 and P2, look at exploitability. If a hostile caller can reach it, P1. If it requires a privileged caller to misuse, P2.
- Findings that depend on off-chain assumptions (oracle compromise, sponsor wallet leak) belong in their own "external risks" section, not the P0 to P3 list. Document them, but do not let them inflate the in-scope severity counts.

## Examples by category

Capability issues are usually P0. Validation issues are P0 if they touch funds, P1 if they touch state without funds. Test coverage gaps are P2 unless the entry function moves funds, in which case P1. Style is always P3.
