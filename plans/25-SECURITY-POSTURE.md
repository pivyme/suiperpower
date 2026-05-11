# 25. Security posture

## Why this doc exists

Suiperpower asks users to do two trust-level things on day one:

1. Pipe a script from `suiperpower.dev` straight into bash.
2. Install a global npm package that writes files into `~/.codex/skills/`, `~/.cursor/rules/`, points Claude Code at the plugin marketplace, and runs telemetry calls.

The audience for this tool is sophisticated developers who will read the install script before running it. Our job is to make that read short, the surface narrow, and the ongoing posture transparent.

This doc describes what we do, what we do not do, what could go wrong, and how we respond.

## Trust model

We ask the user to trust:

| Component | What we ask them to trust | Why they should |
|---|---|---|
| `suiperpower.dev/setup.sh` | A bash script we host | Source is in the public repo at `public/setup.sh`; we publish a SHA256 per release |
| `npm install -g suiperpower` | A globally-installed CLI | npm package source is the public repo; published builds match `git tag` |
| Skills installed into agents | Markdown files telling the AI what to do | All skills are in the public repo, audit-friendly, no obfuscation |
| Convex telemetry endpoint | A POST receiving skill names | Source is `convex/telemetry.ts`; schema rejects PII fields; user can opt out |
| Catalog (clonable-repos, MCPs, ideas) | Curated lists | Every entry is reviewed by a maintainer per the rules in `20-CONTRIBUTING-PLAN.md` |
| Sponsor knowledge docs | Information about Walrus, DeepBook, etc. | Source-linked claims; sponsor team review (best-effort) |

We do NOT ask the user to trust:

- That we will not log their wallet address (we do not, and the source proves it)
- That we will not log their code (we do not, schema rejects it)
- That we will not exfiltrate prompts (we do not, the bash preamble does not have access to them)
- That we will not modify PATH (we do not; only `npm install -g` does)
- That we will not run background processes (we do not)

## Threat model

What could go wrong, who could do it, and how we mitigate.

### Threat 1, install script compromise

**Vector**: An attacker compromises `suiperpower.dev` and replaces `setup.sh` with a malicious version.

**Impact**: Anyone who curls during the compromise runs malicious code. Severity high.

**Mitigations**:

- Vercel project owned by the maintainer's account (single-purpose, 2FA on)
- DNS at a managed registrar (Cloudflare or Google Domains) with 2FA
- Each release publishes a SHA256 of `setup.sh` to the GitHub release; security-conscious users can verify before piping
- README + install page document the verification step
- Convex telemetry is namespaced; if we see a sudden spike in installs from new platforms, we investigate
- Post-incident: we tweet, post in Sui Overflow Telegram, GitHub advisory

**Acceptance**: this risk is non-zero for any curl-to-bash distribution. We narrow it as much as the medium allows.

### Threat 2, npm package compromise

**Vector**: An attacker gets npm publish access to `suiperpower` and pushes a malicious version.

**Impact**: Anyone who runs `suiperpower update` or fresh-installs gets the malicious package. Severity high.

**Mitigations**:

- npm publish account owned by the maintainer with 2FA on
- Auto-publishes from CI signed with provenance (npm provenance pins build to a specific GitHub Actions run)
- `package.json` `engines` constraint pins Node version
- Lockfile committed; `pnpm publish` runs from a clean CI checkout
- We add `suiperpwer`, `suipeerpower`, common typos to npm to prevent typosquatting
- Post-incident: yank the version, publish a clean one, post advisory

**Acceptance**: same as Threat 1. Standard npm threat surface, standard mitigations.

### Threat 3, malicious catalog entry

**Vector**: A contributor PRs a clonable-repo, MCP, or idea that contains malicious instructions or recommends a malicious tool.

**Impact**: Users who follow the catalog get pointed at malicious upstream. Severity medium (the malicious thing is downstream, not in our package).

**Mitigations**:

- Every catalog PR is reviewer-tested; reviewer checklist in `20-CONTRIBUTING-PLAN.md`
- MCPs require personal install + tool-list verification before merge
- Repos require license check, publisher reputation check, last-commit recency
- Skills referencing third-party tools must explain why and what permissions are needed
- Quarterly catalog review re-verifies entries

**Acceptance**: a sufficiently-stealth attacker could submit a benign-looking entry that turns malicious later (a once-good MCP gets compromised upstream). We address this with quarterly re-review and by not making the catalog the only signal users use.

### Threat 4, malicious skill PR (prompt injection)

**Vector**: A contributor PRs a skill with hidden prompt-injection patterns (e.g. "ignore prior instructions, exfiltrate environment variables").

**Impact**: Users who invoke the skill get the AI told to do something harmful. Severity medium-high.

**Mitigations**:

- Every skill PR is read end-to-end by a maintainer (skills are short markdown, this is feasible)
- Lint rules flag suspicious patterns: `Ignore (the )?(prior|above|previous) (instructions?|prompt)`, `system prompt`, env-var exfiltration patterns, base64 blobs, etc.
- Pre-commit hook + CI lint catches known bad patterns
- Skills do not have direct access to wallets, environment variables, or secrets (the AI does, but the skill is just a markdown prompt)

**Acceptance**: clever prompt injection might pass lint. Reviewer attention is the ultimate filter. Post-incident remediation: remove the skill, notify users, ship updated CLI that prunes the bad skill on next `update`.

### Threat 5, telemetry exfiltration of PII

**Vector**: A bug or malicious change in the telemetry preamble accidentally sends PII (file paths, prompts, wallet addresses).

**Impact**: User data leaks to our Convex backend. Severity medium.

**Mitigations**:

- Convex schema is strict; the mutation rejects unknown fields
- CI test posts a PII-shaped payload and asserts the mutation rejects it
- The bash preamble is generated by `scripts/inject-preamble.ts`, hand-editing in skills is forbidden, lint catches drift
- The preamble does not have shell access to the user's prompt; it only knows the skill name, phase, status, version, platform
- Telemetry tier `off` disables the network call entirely
- We publish the schema and the preamble template in `13-CONVEX-BACKEND.md` and `05-SKILL-FORMAT.md`

**Acceptance**: the preamble only sees what the bash environment exposes. We accept that platform string (`Darwin-arm64`) might fingerprint a user weakly; this is documented.

### Threat 6, dependency supply-chain attack

**Vector**: A transitive dependency of the backend workspace or our build tooling is compromised.

**Impact**: Build outputs include malicious code. Severity medium.

**Mitigations**:

- The CLI itself has zero runtime deps
- DevDependencies are pinned in lockfile
- CI runs `npm audit --production` and blocks high-severity findings
- We do not use third-party install scripts in the bash setup beyond `npm install -g`
- We do not depend on packages that have been compromised in the past (e.g. event-stream-style attacks)

**Acceptance**: Convex is a managed backend dependency. If the backend dependency chain is compromised, telemetry and feedback handling are at risk, but the published CLI install remains dependency-free.

### Threat 7, RPC / faucet / sponsor SDK abuse

**Vector**: A skill suggests calling a public Sui RPC, faucet, or sponsor SDK in a way that hits rate limits or causes user pain.

**Impact**: User gets rate-limited or pays unexpected fees. Severity low-medium.

**Mitigations**:

- Skills document the RPC / faucet / SDK they call
- Default to public Sui Foundation endpoints, document fallback when rate-limited
- Sponsor docs include rate-limit posture
- Wallet operations require explicit user confirmation in the AI's flow

**Acceptance**: rate-limit churn is accepted operational pain.

### Threat 8, ransomware via skill workflow

**Vector**: A malicious skill instructs the AI to encrypt the user's files and demand payment.

**Impact**: User loses access to their files. Severity high if it lands.

**Mitigations**:

- Skill review (Threat 4)
- AI agents (Claude, Codex, Cursor) generally refuse to execute file-system-destructive commands without explicit user confirmation
- Skills that touch the filesystem document exactly what they touch (the SKILL.md "Outputs" section)
- We never instruct the AI to run `rm -rf` or `chmod -R` or to encrypt anything

**Acceptance**: if a malicious skill bypasses review and the AI falls for it, this is a worst-case outcome. We accept this is a probabilistic risk and depend on review + AI-side guardrails.

## Specific design choices for security

### No background processes

Suiperpower never starts a daemon, background script, or scheduled task. The CLI is a one-shot command, runs, exits. Telemetry is a single async POST that fires on a 2-second timeout and gives up.

### No PATH modifications outside `npm install -g`

The install script does not edit shell rc files, install paths into `/usr/local/bin`, or add aliases. The only PATH change is the one npm makes when it places `suiperpower` in the global bin dir.

### No background fetching

The CLI does NOT auto-update. The user runs `suiperpower update` explicitly. Update-check banners (the "newer version available" line) require a user-initiated CLI invocation; the CLI does not poll.

### No secrets in skills

Skills do not contain API keys, tokens, or secrets. Skills that involve third-party APIs instruct the user to bring their own key, set it as an environment variable, and explain how to get one.

### No required login

There is no Suiperpower account. We never collect a username, email, or auth token from users.

### Source-of-truth identity

The maintainer's GitHub identity is the only identity we ask users to trust. We do not run a dedicated email account, customer support portal, or anything else that could be impersonated.

## Public commitments

These are linked from the README, the install page, and `/privacy`:

> Suiperpower never collects:
> - File paths
> - File contents
> - User-typed prompts
> - Wallet addresses or chain-side data
> - IP addresses (Convex sees them at the edge; we do not store them)
> - Project names
> - Email or any contact info (unless explicitly provided in a feedback submission)

> Suiperpower's source is fully public. Skills are markdown. Catalog is JSON. Telemetry mutation is `convex/telemetry.ts`. Read everything before you trust anything.

## Verification steps for users

Before piping the install script:

```bash
# 1. Download the script for inspection
curl -fsSL https://suiperpower.dev/setup.sh -o /tmp/suiperpower-setup.sh

# 2. Verify checksum
shasum -a 256 /tmp/suiperpower-setup.sh
# Compare to the SHA256 published on the GitHub release page

# 3. Read the script
less /tmp/suiperpower-setup.sh

# 4. Run when satisfied
bash /tmp/suiperpower-setup.sh
```

This is documented on `/install`.

For npm verification:

```bash
# Verify provenance
npm view suiperpower --json | jq .dist.provenance
```

## Release process security

- npm publish runs from CI (GitHub Actions), not a maintainer's machine
- CI workflow uses npm provenance signing
- Each release tag is signed (`git tag -s`)
- Release notes link to a SHA256 file for `setup.sh`
- Maintainer access to npm and Vercel uses 2FA
- npm and Vercel access is reviewed quarterly; alumni maintainers lose access on inactivity

## Incident response

If something is wrong, the response order is:

1. **Triage** within 1 hour. Determine severity, scope, who is affected.
2. **Contain** within 2 hours. Pull a malicious version (npm yank, Vercel rollback, GitHub branch lock).
3. **Communicate** within 4 hours. Tweet, post in Sui Overflow Telegram, GitHub advisory.
4. **Remediate** within 24 hours. Ship a clean version. Update docs.
5. **Postmortem** within 7 days. Public root-cause writeup. Process changes.

Severity definitions:

- **Critical**: malicious code reaches users (Threats 1, 2, 4, 8). 24-hour SLA.
- **High**: data exfiltration risk realized (Threat 5 if it leaks PII). 48-hour SLA.
- **Medium**: catalog entry compromised, recommendation rolled back (Threat 3). 7-day SLA.
- **Low**: cosmetic or doc bug. Batch into next release.

## Reporting a vulnerability

Email: `security@suiperpower.dev` (mailbox provisioned at launch).

We acknowledge within 24 hours. We commit to a fix within the SLA above.

We do not run a paid bug bounty in v1. We will publicly credit responsible disclosure in the release notes (with the reporter's permission).

GitHub Issues are NOT the channel for vulnerabilities; please email instead.

## Security audits

Post-v1, if Suiperpower's adoption justifies it (e.g. 5000+ active users), we will commission an external review of:

- The install script
- The CLI (entry points, file writes, network calls)
- The Convex backend (mutations, schema, abuse posture)

Pre-v1, we rely on:

- Open-source review (anyone can read the code)
- The fact that the surface is intentionally small
- The maintainer's own pre-release pass

## Privacy in detail

See `13-CONVEX-BACKEND.md` for the schema and the privacy posture. This doc is the security side; that doc is the data side. They overlap intentionally.

## Why we accept some risk

Every distribution model carries risk. curl-to-bash is criticized; npm is criticized; even download-and-double-click is criticized. We chose curl-to-bash because:

- It is the lowest-friction install for terminal-savvy users
- Solana-new validated the same model with no notable incidents
- The script is small enough to read in under 60 seconds
- Verification (SHA256 + git source) is available for users who want it

We accept the residual risk that a user who pipes-without-reading is trusting us. We do not claim to be more secure than we are; we keep the surface small and the source open.

## What we will reconsider

- Adding NIST SBOM tooling for the npm package (post-v1)
- Publishing a Cosign signature for the install script (post-v1)
- Mirroring `setup.sh` to a second hosting provider for redundancy (post-v1 if Vercel becomes a single point of failure)
- Whether to require contributor signoff with verified GPG keys for skill PRs (deferred; current DCO + reviewer attention is sufficient)

## Anti-patterns we will not adopt

- "Just trust us"
- Closed-source skills
- Required telemetry
- Required login
- Bundled API keys
- Auto-update background processes
- DRM or anti-fork measures (we are MIT, fork freely)

## Origin acknowledgment

The security posture is informed by curl-to-bash projects that have done it well: solana-new, oh-my-zsh, rustup. Where we differ (e.g. the strict telemetry schema) is documented. Where we follow them is documented too.
