# Tracing Move aborts

A `MoveAbort` carries an `abort_code` and the location (module address, module name, function index). Tests and on-chain transactions both report it. The job is to map the code back to the source `assert!` or named error constant that produced it.

## Sources of abort codes

Move modules typically declare named error constants:

```move
const E_NOT_AUTHORIZED: u64 = 1;
const E_INSUFFICIENT_BALANCE: u64 = 2;
const E_ALREADY_INITIALIZED: u64 = 3;
```

Then use them in `assert!`:

```move
assert!(coin::value(&payment) >= price, E_INSUFFICIENT_BALANCE);
```

When that assertion fails, the abort code is `2` and the location identifies the module and function.

## In a unit test

`sui move test` output shows:

```
[ FAIL ] my_pkg::my_module::test_unauthorized
└── MoveAbort(MoveLocation { module: 0x0::my_module, function: 5, instruction: 12, function_name: Some("authorize") }, 1) in command 0
```

Look at `function_name` (the offending function) and the abort code (`1`). Grep the module for `: u64 = 1` to find the named constant, then for the constant in `assert!` calls.

## In a `#[expected_failure]` test

```move
#[test]
#[expected_failure(abort_code = my_pkg::my_module::E_NOT_AUTHORIZED)]
fun test_unauthorized() { ... }
```

If a test that expects failure passes for the wrong reason (a different abort code than expected), it should be a fail. Always specify the abort code, never just `#[expected_failure]` alone, that matches any failure.

## On testnet

Get the transaction digest from the user. Then:

```bash
sui client tx-block <digest>
```

Look for `Transaction Block Effects > Status > Failure`. The status will read like:

```
MoveAbort(MoveLocation { module: 0x<addr>::my_module, function: 5, function_name: Some("authorize") }, 1) in command 2
```

The `command 2` tells you which PTB command aborted. Combine with the function name and abort code to find the source.

## Common patterns

- **Capability check fails (`E_NOT_AUTHORIZED`)**: caller is not the holder of the expected `&AdminCap`. Either the wrong wallet signed, or the cap was transferred and the caller did not update.
- **Insufficient balance (`E_INSUFFICIENT_BALANCE`)**: payment coin does not cover the price. Check the input `Coin<T>` value before the call.
- **Already initialized (`E_ALREADY_INITIALIZED`)**: trying to call `init`-style logic twice. The module pattern is broken; logic that needs runtime initialization should not gate on a boolean, it should consume a one-shot Object.
- **Object not found**: NOT an abort code, this is a Sui execution error meaning the input Object does not exist or is not owned by the sender. Check `sui client object <id>`.

## Tooling tip

For repeatable abort tracing on a complex PTB, use `sui client dev-inspect-transaction-block` (read-only execution). It surfaces the same abort with a richer trace and does not consume gas.

## What to write back

Append to `.suiperpower/build-context.md`:

```markdown
### Abort traced, <timestamp>
- transaction or test: <digest | test name>
- abort: <module>::<fn>, code <n> (<E_CONST_NAME>)
- root cause: <one sentence>
- fix: <what changed in module or call site>
```
