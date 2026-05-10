# Move.toml defaults

A canonical `Move.toml` that compiles cleanly against current Sui CLI.

## Template

```toml
[package]
name = "my_package"
version = "0.1.0"
edition = "2024.beta"
authors = ["<team or author>"]
license = "MIT"

[dependencies]
Sui = { git = "https://github.com/MystenLabs/sui.git", subdir = "crates/sui-framework/packages/sui-framework", rev = "<pinned-rev>" }

[addresses]
my_package = "0x0"

[dev-dependencies]
# add test-only deps here

[dev-addresses]
# override addresses for testing if needed
```

## Pinning the Sui framework

Always use `rev` (a commit hash or release tag), never `branch = "main"`. `main` moves over time and breaks reproducibility.

To pick a current rev:

1. Visit `https://github.com/MystenLabs/sui/releases`.
2. Pick the latest release tag (e.g. `mainnet-v1.X.Y`).
3. Use the tag as the `rev`.

Document the chosen rev in `build-context.md` so future contributors know what to bump and when.

## Package name

The package name maps to the on-chain identifier. Lowercase snake_case, matches the directory name.

```
move/my_pkg/Move.toml         -> package name "my_pkg"
move/lending_protocol/Move.toml -> package name "lending_protocol"
```

The address `my_package = "0x0"` is the placeholder; on publish, Sui assigns the real address. The placeholder must remain `"0x0"` in source-controlled files.

## Edition

Use the latest edition that the target Sui CLI supports. As of 2026-05, `2024.beta` is current. Check the Sui release notes when bumping the framework rev to confirm edition compatibility.

## Adding a sponsor dep (example: OpenZeppelin Sui)

```toml
[dependencies]
Sui = { ... }
OpenZeppelin = { git = "https://github.com/OpenZeppelin/openzeppelin-sui.git", rev = "<pinned-tag>" }
```

Same pinning rule. Bump deliberately.

## Test scaffold

The `tests/` directory holds Move tests. Convention: one test file per source module.

```
move/my_pkg/sources/treasury.move
move/my_pkg/tests/treasury_tests.move
```

Test attributes:

```move
#[test_only]
module my_package::treasury_tests {
    use my_package::treasury;
    use sui::test_scenario;

    #[test]
    fun test_basic_deposit() {
        let mut scenario = test_scenario::begin(@0xA);
        // ...
        test_scenario::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = treasury::E_NOT_AUTHORIZED)]
    fun test_unauthorized_caller_aborts() {
        // ...
    }
}
```

`test_only` keeps the helper out of the published binary.

## Common compilation errors at scaffold time

- "Package not found": the framework rev is incompatible with the local Sui CLI version. Bump CLI or rev.
- "Address conflict": you renamed the package without updating `[addresses]`.
- "Edition not supported": framework rev expects a different edition. Match them.

## After successful build

Once `sui move build` succeeds, capture the resulting BuildInfo:

```bash
sui move build
ls build/<package_name>/
```

The `build/` directory contains the compiled bytecode and a `BuildInfo.yaml`. Add `build/` to `.gitignore`; only the source is committed.

Last updated: 2026-05-10.
