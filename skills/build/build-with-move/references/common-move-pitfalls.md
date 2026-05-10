# Common Move Pitfalls (Sui)

Mistakes that compile or look correct, then bite at deploy or in production. Skim before authoring; refer back when something behaves unexpectedly.

## Ability Mismatches

- **`key` on a nested struct**: only top-level Objects need `key`. A field type with `key` confuses the type system into thinking the field is itself addressable.
- **Missing `store`**: a struct intended to live inside another Object needs `has store`. Without it, the parent will not compile.
- **Accidental `drop`**: adding `has drop` to a resource holding value lets the runtime silently discard it. A coin balance struct with `drop` is a bug, not a feature.
- **Adding `copy` to anything stateful**: `copy` means the runtime can duplicate the value. Combined with state, this duplicates wealth.

## Capability Leakage

- Passing `AdminCap` or `TreasuryCap` by value into a `public` function. The caller can re-route it.
- Returning a capability from a public function. Anyone calling the function gains the authority.
- Storing a capability inside a Display field. Display data is publicly readable; the cap is exposed.
- A `friend` declaration that lets another module mint or burn through your cap. Audit every friend.

The fix in most cases: pass by reference (`&AdminCap`), and prefer `public(package)` over plain `public` when the function exists for internal callers only.

## Shared Object Versioning

- Mutating a shared Object inside a transaction races against the consensus version. Two PTBs in the same checkpoint can both succeed if they are commutative; non-commutative mutations need explicit locking via owned helper Objects.
- Reading a shared Object inside a `&` ref and writing it later inside the same block does not give you read-your-writes semantics across separate transactions; design accordingly.

## Init Function Gotchas

- The one-time witness (OTW) struct must be named exactly like the module in caps and have `has drop`. A typo silently disables the OTW guarantee.
- `init` runs once at publish. You cannot call it again. Anything that needs runtime initialization must be its own entry function with proper authority gating.
- `init` cannot read state from other packages; the publish transaction is its only context.

## Tests

- Forgetting `test_scenario::end(scenario)` leaves objects "orphaned" in test state. The test passes, but it has not exercised destruction paths. Always end the scenario.
- Not asserting expected failures with `#[expected_failure(abort_code = ...)]`. A test that "expects failure" but does not specify the code can pass on the wrong abort.
- Mocking time or randomness with hand-rolled values when `sui::clock` and `sui::random` exist. Hand-rolled mocks drift from production behavior.

## Move.toml Issues

- Floating dependency revisions (`branch = "main"` or no rev pin). Two builds of the same source can produce different bytecode. Always pin to a specific `rev` or `tag`.
- Missing the `Sui` framework dep when using stdlib functions. The error surfaces at build, but as a cryptic resolution failure, not "missing dep."
- Wrong edition string. `edition = "2024"` enables Move 2024 syntax (`public(package)`, etc.). Without it, modern syntax errors out.

## PTB-side Surprises

- Designing a function whose correctness depends on the PTB calling other functions in a specific order. A malicious PTB rearranges the calls.
- Treating a sponsored transaction's signatures as proof of intent. The user signs the entire PTB; the sponsor can append moves. Validate every Object reference your function consumes.

## Visibility Mistakes

- `public` on a function that should be `public(package)`. External callers gain access you did not intend.
- `entry` on a function that should not be PTB-callable. `entry` is required for PTB invocation; do not add it casually.
- Forgetting `entry` on a function the frontend needs to call from a PTB. The dapp will fail at sign time with no clear error.

## Type Confusion in Generics

- Reusing a generic type parameter name across modules with different bounds. Move's type system catches most cases, but error messages get cryptic. Use distinct names per module.
- Building a `Bag` or `Table` keyed by a type that does not have the abilities the container requires. The error surfaces only when you try to insert.

## Numeric Truncation

- Casting `u128` to `u64` (`x as u64`) silently drops the high bits. If a u128 multiplication exceeds u64, you lose value without an abort.
- Performing arithmetic in a wider type than necessary because "to be safe." Use the smallest type that fits your range; widening wastes gas.

## Build vs. Publish Mismatch

- `sui move build` succeeds but `sui client publish` fails with a dependency resolution error. Cause: `Move.toml` references a rev that exists locally but not in the published Sui framework version. Pin against the same Sui framework rev your CLI was built against.

When something behaves strangely, check this list first. The fix is often boring.
