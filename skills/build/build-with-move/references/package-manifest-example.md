# Move.toml, Canonical Example

A starting `Move.toml` with pinned Sui framework dependencies, ready to copy into a new package.

```toml
[package]
name = "my_package"
version = "0.1.0"
edition = "2024.beta"
license = "MIT"
authors = ["your-name <you@example.com>"]

[dependencies]
Sui = {
  git = "https://github.com/MystenLabs/sui.git",
  subdir = "crates/sui-framework/packages/sui-framework",
  rev = "framework/testnet"
}

[addresses]
my_package = "0x0"

[dev-addresses]
my_package = "0xCAFE"
```

## Why each section

- `[package]`: identity. `edition = "2024.beta"` enables Move 2024 syntax (`public(package)`, struct field access, etc.). Drop the `.beta` suffix when the stable 2024 edition tag is current in your CLI.
- `[dependencies]`: what your package imports. Pin every dep to a specific rev or tag. `framework/testnet` and `framework/mainnet` are common branch tags; for stricter pinning, use a commit SHA.
- `[addresses]`: the address your modules deploy under. `0x0` is a placeholder that gets rewritten by the publisher to your actual address.
- `[dev-addresses]`: address used during `sui move test`. Any value works; common convention is `0xCAFE`.

## Adding a sponsor dependency

When integrating a sponsor SDK on chain, add it under `[dependencies]`:

```toml
[dependencies]
Sui = { git = "https://github.com/MystenLabs/sui.git", subdir = "crates/sui-framework/packages/sui-framework", rev = "framework/testnet" }
Walrus = { git = "https://github.com/MystenLabs/walrus.git", subdir = "contracts/walrus", rev = "<pinned-rev>" }
DeepBook = { git = "https://github.com/MystenLabs/deepbookv3.git", subdir = "packages/deepbook", rev = "<pinned-rev>" }
```

Always pin `rev`. Floating revs make builds non-reproducible.

## Add OpenZeppelin Sui libs

```toml
[dependencies]
OpenZeppelinSui = {
  git = "https://github.com/OpenZeppelin/sui-contracts.git",
  rev = "<pinned-rev>"
}
```

(Confirm the upstream repo and subdir path against the OZ Sui release current at the time of authoring; the exact path moves between releases.)

## Multi-network setup

For a package that targets both testnet and mainnet, you can keep one `Move.toml` and switch the rev branch via env-aware tooling, or maintain separate manifests:

```
Move.toml             # default, targets testnet rev
Move.mainnet.toml     # mainnet rev
```

Then publish with `--manifest-path Move.mainnet.toml`.

## Linting checklist before publish

- Every `[dependencies]` entry has a `rev` or `tag`. No bare `branch`.
- Edition is set explicitly.
- Address placeholder is `0x0` for production publishes (the CLI rewrites it).
- License is set.
- Authors are set if shipping publicly.

The `pre-mainnet checklist` in `skills/data/guides/deploy-runbook.md` repeats some of these for a reason: the same mistake at mainnet costs real SUI.
