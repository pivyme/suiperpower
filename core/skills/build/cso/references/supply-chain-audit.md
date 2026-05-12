# Supply chain audit checklist

Covers npm/pnpm dependency auditing, Move dependency verification, and package ID pinning for Sui projects.

## npm / pnpm dependency audit

### Run the audit

```bash
# Check for known vulnerabilities
npm audit --production
# or
pnpm audit --prod

# Fix automatically where possible
npm audit fix
```

### What to check

| Item | Pass criteria |
|---|---|
| No critical or high vulnerabilities | `npm audit` reports 0 critical, 0 high |
| No abandoned packages (>2 years no publish) | Check last publish date on npmjs.com |
| No typosquatting risk | Package name matches the official name exactly (e.g., `@mysten/sui`, not `mysten-sui`) |
| Lockfile committed | `pnpm-lock.yaml` or `package-lock.json` is in version control |
| No postinstall scripts from untrusted packages | Review `scripts.postinstall` in dependency `package.json` files |
| Peer dependency versions match | No conflicting peer dependency warnings |

### Common Sui ecosystem packages to verify

| Package | Canonical name | Verify at |
|---|---|---|
| Sui TS SDK | `@mysten/sui` | https://www.npmjs.com/package/@mysten/sui |
| Seal SDK | `@mysten/seal` | https://www.npmjs.com/package/@mysten/seal |
| Walrus SDK | Check official docs for current package name | https://docs.walrus.site/ |
| DeepBook SDK | `@mysten/deepbook` | https://www.npmjs.com/package/@mysten/deepbook |
| dApp Kit | `@mysten/dapp-kit` | https://www.npmjs.com/package/@mysten/dapp-kit |

Note: `@mysten/sui.js` is the legacy package name. The current SDK is `@mysten/sui`. If the project uses the old name, flag it for migration.

## Move dependency verification

### Check Move.toml

Every Move dependency must be pinned to a specific revision or tag, never a branch head.

```toml
# GOOD: pinned to a specific rev
[dependencies]
Sui = { git = "https://github.com/MystenLabs/sui.git", subdir = "crates/sui-framework/packages/sui-framework", rev = "abc1234" }

# BAD: floating on a branch
[dependencies]
Sui = { git = "https://github.com/MystenLabs/sui.git", subdir = "crates/sui-framework/packages/sui-framework", branch = "main" }
```

### Verify on-chain package IDs

For any dependency that references a published package ID (e.g., DeepBook, Scallop), confirm the ID matches the canonical published version:

1. Get the expected package ID from the project's official docs or GitHub.
2. Query the Sui RPC: `sui client object <package-id>` to confirm it exists and matches the expected module names.
3. Compare the module bytecode hash if the project publishes one.

### What to flag

| Finding | Severity |
|---|---|
| Move dependency on `branch = "main"` or `branch = "develop"` | P1: supply chain risk, build is non-reproducible |
| Unrecognized git URL in Move.toml | P1: verify the source is the canonical repo |
| Published package ID does not match official docs | P0: possible address poisoning |
| npm package with `postinstall` script that runs network calls | P1: review the script for exfiltration |
| Dependency with known CVE at critical severity | P0: update or replace immediately |
| Dependency with known CVE at high severity | P1: update within the sprint |
| Abandoned dependency (no updates in 2+ years, low usage) | P2: evaluate alternatives |
