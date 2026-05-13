---
name: cso
description: Use when running a CSO-style customer signal review for a Sui product.
---

## Preamble (run first)

```bash
# Suiperpower telemetry. Routes through the CLI so projects.json + Convex stay in sync.
# Silent on failure so the skill never blocks. Opt out: SUIPERPOWER_TELEMETRY=off.
#
# AGENT NOTE: when this skill finishes, run the matching completion command:
#   suiperpower track cso build completed
# Or use "failed" / "aborted" if it ended that way.
command -v suiperpower >/dev/null 2>&1 && suiperpower track cso build started >/dev/null 2>&1 &
true
```

If `TEL_PROMPTED` is `no`, before doing real work, ask the user:

> Help suiperpower get better. We track which skills get used and how long they take. No code, no file paths, no PII. Change anytime in `~/.suiperpower/config.json`.
>
> A) Sure, anonymous
> B) No thanks

Write the answer to `~/.suiperpower/config.json` `telemetryTier` field and create `~/.suiperpower/.telemetry-prompted`. Then continue.

## What this skill does

Runs a structured infrastructure security audit on a Sui project. Walks through STRIDE threat modeling, OWASP-mapped checks, dependency supply chain verification, RPC/API hardening, key management, and frontend security. Produces a findings report with severity ratings and a remediation plan. Every P0 finding must have a fix or an accepted-risk decision before the audit is declared complete.

## When to use it

- The user wants a security review of their full Sui application (Move + frontend + infra).
- The user is preparing for a security audit or OtterSec engagement.
- The user says "threat model", "STRIDE", "OWASP", or "security audit".
- The user wants to harden their app before mainnet deployment.
- The user wants a supply chain or dependency audit.

## When NOT to use it

- If the user only wants a Move code review, use `review-move` instead.
- If the user wants OtterSec-specific audit prep, use `ottersec-prep` instead.
- If the user has not scaffolded a project yet, use `scaffold-project` first.
- If the user wants to fix a specific Move bug, use `debug-move`.
- If the user wants to deploy, use `deploy-to-testnet` or `deploy-to-mainnet`.

If you activated this and the user actually wants something else, consult `skills/SKILL_ROUTER.md` and hand off.

## Inputs

- A Sui project with at least one of: Move package, TypeScript frontend, backend API, or deployment config.
- Optional: `.suiperpower/build-context.md` from prior skills. Read it if present.
- Optional: deployment target (testnet, mainnet) and RPC endpoint in use.

If the project scope is unclear, interview the user for:

- What components exist? (Move contracts, TS frontend, backend API, off-chain workers)
- What auth mechanism is in use? (zkLogin, wallet-only, API keys)
- Are there admin capabilities or privileged operations?
- What third-party services does the app call? (RPC, Walrus, DeepBook, external APIs)
- Is this pre-deploy or already live?

## Outputs

- A structured findings report appended to `.suiperpower/build-context.md` with severity levels (P0 critical, P1 high, P2 medium, P3 low).
- A remediation plan with concrete fix instructions for each P0 and P1 finding.
- Append to `.suiperpower/build-context.md`:

  ```markdown
  ## cso session, <timestamp>
  - scope: <components audited>
  - findings: P0=<n> P1=<n> P2=<n> P3=<n>
  - P0 findings resolved: <yes | no, list remaining>
  - threat model: STRIDE completed for <components>
  - supply chain: <clean | issues found>
  - open issues: <list>
  ```

## Workflow

### 1. Context gathering

- Read `.suiperpower/build-context.md` if it exists.
- Inventory the project: list Move packages, TS/JS source directories, backend code, config files, deployment manifests.
- Identify the attack surface: public entry points, admin functions, external integrations, user-facing APIs.

### 2. STRIDE threat model

For each component, walk through the six STRIDE categories. See `references/security-checklist.md` for the Sui-specific STRIDE table.

| Category | Question |
|---|---|
| **S**poofing | Can an attacker impersonate a user or admin? |
| **T**ampering | Can an attacker modify on-chain state, PTBs, or API requests? |
| **R**epudiation | Can actions be denied without audit trail? |
| **I**nformation disclosure | Can sensitive data leak from Move objects, RPC responses, or frontend state? |
| **D**enial of service | Can an attacker exhaust shared object contention, rate limits, or gas? |
| **E**levation of privilege | Can a user escalate to admin via capability leaks or missing auth checks? |

Document findings per component. Assign severity.

### 3. Authentication and session audit

- Check auth mechanism: zkLogin session handling, wallet signature verification, API key validation.
- Verify session expiry and refresh logic. zkLogin ephemeral keys must have bounded TTL.
- Check for user enumeration in error messages.
- Verify rate limiting on auth endpoints.

### 4. Authorization audit

- List all privileged operations (admin functions, treasury access, config changes).
- Verify each has a capability check or ownership assertion in Move.
- Check for missing authorization on PTB composition (can a user compose a PTB that bypasses intended access control?).
- Verify shared object access patterns do not allow unauthorized mutation.

### 5. Input validation

- Check Move entry functions: are all parameters validated (bounds, types, sizes)?
- Check frontend inputs: is server-side validation present, not just client-side?
- Check for injection vectors in any backend APIs (SQL, command, path traversal).
- Verify PTB composition safety: can a user inject unexpected calls into a sponsored PTB?

### 6. Dependency supply chain audit

- Run `npm audit` (or equivalent) on the TS/JS project. Flag high and critical findings.
- Check Move dependencies in `Move.toml`: are they pinned to a specific `rev` or `tag`, not floating?
- Verify package IDs: for any on-chain dependency, confirm the package ID matches the canonical published version.
- Check for known-compromised or abandoned dependencies.
- See `references/supply-chain-audit.md` for the full checklist.

### 7. RPC and API security

- Identify all RPC endpoints in use (Sui fullnode, custom indexer, Walrus, DeepBook).
- Check for hardcoded RPC URLs that could be MITM'd.
- Verify API keys are not committed to source.
- Check CORS configuration on any custom backend.
- Verify rate limiting and error handling for RPC failures.

### 8. Key management

- Check how private keys and mnemonics are handled (never in source, never in logs).
- Verify `.env` files are in `.gitignore`.
- Check sponsored transaction gas limits (unbounded sponsorship = gas drain attack).
- Verify admin capability objects are stored safely (not in shared objects, not transferable without intent).

### 9. Frontend security

- Check for XSS vectors: is user input rendered without escaping?
- Check for CSRF protection on state-changing requests.
- Verify Content Security Policy headers.
- Check that wallet adapter integration does not expose private keys or session tokens.
- Verify that sensitive data (balances, addresses) is not cached in localStorage without encryption.

### 10. Remediation plan and writeback

- Compile all findings into a severity-ordered list.
- For each P0 and P1 finding, write a concrete fix with code or config changes.
- For P2 and P3, document the finding and recommended fix timeline.
- Append the session record to `.suiperpower/build-context.md`.

### 11. Closing handoff

- If `.suiperpower/intent.md` exists and the session was non-trivial (new module, new sponsor integration, or material changes to public functions), recommend `verify-against-intent` as the next step so drift is caught before shipping.
- If no `intent.md` exists and the session was non-trivial, surface that gap once: offer `clarify-intent` to backfill, do not force it.

## Quality gate (anti-slop)

Before reporting done, the skill asks itself the following and refuses to declare success if any answer is no:

- Was every component in the project inventoried and audited?
- Did the STRIDE threat model cover all six categories for each component?
- Does every P0 finding have either a fix committed or an explicit accepted-risk decision from the user?
- Were Move capability patterns checked for leaks?
- Was the dependency supply chain actually checked (not just assumed clean)?
- Were sponsored transaction gas limits verified if sponsorship is in use?
- Is the findings report written to `.suiperpower/build-context.md`, not just discussed verbally?

If any answer is no, the skill reports the gap and works through it before claiming the audit is complete.

## References

On-demand references (load when relevant to the user's question):

- `references/security-checklist.md`: STRIDE categories with Sui-specific items, OWASP top 10 mapped to Sui patterns.
- `references/supply-chain-audit.md`: npm audit workflow, Move dependency verification, package ID pinning.

Knowledge docs (load when scope expands beyond what is in references):

- `skills/data/sui-knowledge/sponsor-docs/walrus.md`: Walrus security considerations for encrypted blob storage.

External docs (fetch at runtime for the latest guidance):

- OWASP Top 10: https://owasp.org/Top10/
- OWASP API Security: https://owasp.org/API-Security/editions/2023/en/0x11-t10/
- OWASP Cheat Sheet Series: https://cheatsheetseries.owasp.org/
- Sui Security Best Practices: https://docs.sui.io/guides/developer/app-examples/weather-oracle

## Use in your agent

- Claude Code: `claude "/suiper:cso <your message>"`
- Codex: `codex "/cso <your message>"`
- Cursor: paste a chat message that includes a phrase like "security audit" or "threat model", or load `~/.cursor/rules/cso.mdc` and reference it.

If you activated this and the user actually wants something else, consult `skills/SKILL_ROUTER.md` and hand off.
