# Upgrade policy choice

The first mainnet publish locks an `UpgradeCap` with a policy. Every later upgrade is gated by the policy. Picking the right policy at first publish is one of the most important decisions in the lifecycle of the package.

## Compatible (default)

Future upgrades may add fields and functions but cannot change the signatures of existing public functions, the layouts of existing structs in incompatible ways, or remove modules.

When to pick:

- Most consumer apps in their first year. Upgrades happen, but the public surface should remain stable.
- When the package is composable and other packages depend on its types.

Trade-off: you cannot fix a public signature mistake later without a migration. Get the public surface right at first publish.

## Additive

Future upgrades can only add new modules, structs, and functions. Cannot modify any existing element.

When to pick:

- Protocol-level packages where existing code in the wild must remain valid forever.
- DeFi primitives that integrate with many downstream consumers.

Trade-off: more rigid than compatible. Fewer escape hatches if you got something subtly wrong.

## Dep-only

Upgrades only update the addresses of dependency packages. The package's own code is frozen.

When to pick:

- Hub packages that wire other packages together. The hub's logic does not change; the wiring does.
- Rare, advanced use case.

Trade-off: very rigid. Most projects do not need this.

## Immutable

No future upgrades possible. The `UpgradeCap` is destroyed or frozen at publish time.

When to pick:

- A truly immutable contract: a fixed-supply token, a one-time auction, a vesting contract.
- When the legal or trust posture of the project demands "no rug pull, ever".

Trade-off: bugs cannot be fixed. You ship perfectly or not at all. Choose only when the surface is small enough to audit completely.

## How the skill prompts

The skill defaults to `compatible`. It asks the user to confirm or pick another. If the user picks `immutable`, the skill confirms with a second prompt and reads back: "you cannot change this package after this publish. Type CONFIRM to proceed or anything else to switch to compatible."

The chosen policy is recorded in `deploy-context.md` and cannot be retroactively changed without a fresh deploy.
