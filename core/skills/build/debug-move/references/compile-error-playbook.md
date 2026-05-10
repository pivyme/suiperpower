# Move compile error playbook

The Sui Move compiler produces error codes of the form `error[E0xxxx]` with a span. The span is more important than the code. Always read the highlighted source first, then map the code to a category.

## Ability errors (E04xxx)

- **`E04001 missing ability 'key'`**: a struct used as a top-level Object lacks `has key`. Add `has key, store` (most Objects need both).
- **`E04002 missing ability 'store'`**: a struct used inside another Object's field lacks `has store`. Add it.
- **`E04004 invalid ability constraint`**: trying to instantiate a generic with a type that lacks a required ability. Either add the ability to the inner type or relax the generic constraint.
- **`E04007 cannot drop`**: a value with neither `drop` nor an explicit consumer is being implicitly discarded. Either add `drop` (only safe if the type holds no value) or consume it explicitly with `transfer::public_transfer`, `coin::burn`, or destructuring.

Fix shape: read the struct definition, check the ability list, decide whether the missing ability is correct (some types should NEVER have `drop` or `copy`).

## Type mismatch errors (E03xxx)

- **`E03004 type mismatch`**: passing `&T` where `&mut T` is expected, or vice versa. Adjust call site or function signature, not by casting.
- **`E03007 invalid type argument`**: a generic was instantiated with a type that does not satisfy the constraint. Often co-occurs with E04004.

## Visibility errors (E07xxx)

- **`E07001 invalid public function`**: trying to call a non-public function from outside the module. Either change the callee to `public(package)` (preferred for cross-module within the same package) or genuine `public` if external callers should call.
- **`E07005 invalid friend declaration`**: a `friend` line points at a module that does not exist or is in a different package. Check `Move.toml` named addresses.

## Resource errors (E06xxx)

- **`E06001 unused resource`**: a hot-potato struct (no abilities) was created and never consumed. Trace the function: every code path must consume the value.
- **`E06002 storage error`**: unwrapping a `Coin` to a `Balance` and back without preserving conservation. Audit the math.

## Module / package errors (E01xxx, E02xxx)

- **`E01003 unbound module`**: an import path does not resolve. Check `Move.toml` `[addresses]` and `[dependencies]`. A common cause is a renamed framework address.
- **`E02001 duplicate declaration`**: two structs or functions with the same name in the same module. Rename or merge.

## Move.toml gotchas

These are not error codes but cause confusing build failures:

- Floating dependency rev: `branch = "main"` reads HEAD at build time. Pin to a `rev` or a `tag`.
- Mismatched framework version between user package and dependencies. The compiler will report missing types that "should be there".
- Edition mismatch (`edition = "2024.beta"` vs older syntax). Match edition to syntax.

## Triage shortcut

If the error mentions:

- An ability, jump to ability errors above.
- A type, jump to type mismatch.
- "private" / "friend" / "public", jump to visibility.
- "module not found", jump to Move.toml.
- "abort_code", you are NOT in a compile error. Switch to `references/abort-tracing.md`.

## What to write back

Append to `.suiperpower/build-context.md`:

```markdown
### Compile fix, <timestamp>
- error: <code + one-line summary>
- root cause: <one sentence>
- fix: <file:line, what changed>
- regression test added: <yes | no | n/a>
```
