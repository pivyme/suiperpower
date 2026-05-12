# Security checklist: STRIDE + OWASP for Sui projects

Source: OWASP Top 10 (2021), OWASP API Security Top 10 (2023), adapted for Sui-specific patterns.

## STRIDE categories with Sui-specific items

### Spoofing (identity)

| Check | Sui-specific detail |
|---|---|
| Wallet signature verification | Verify `ed25519` or `secp256k1` signatures on every authenticated request |
| zkLogin session validation | Ephemeral key TTL must be bounded. Verify the OAuth provider JWT before creating a zkLogin proof |
| Sponsored tx sender spoofing | Sponsored transactions must verify the sender address matches the intended user, not just that gas is covered |
| Admin capability impersonation | AdminCap objects must be checked by type and ownership, not by convention |

### Tampering (data integrity)

| Check | Sui-specific detail |
|---|---|
| PTB composition injection | A user composing a PTB can add unexpected calls. Verify that sponsored PTBs restrict allowed commands |
| Shared object race conditions | Concurrent mutations to shared objects can reorder. Design for contention: use owned objects where possible |
| Move module upgrade tampering | If the package uses `UpgradeCap`, verify upgrade policy restricts who can upgrade and what changes are allowed |
| Frontend state tampering | Client-side state (balances, permissions) must be re-verified on chain before critical operations |

### Repudiation (audit trail)

| Check | Sui-specific detail |
|---|---|
| On-chain event emission | Critical operations should emit Sui events for auditability |
| Off-chain logging | Backend APIs should log structured JSON with correlation IDs. No PII in logs |
| Transaction digest tracking | Store transaction digests for critical operations so outcomes can be verified later |

### Information disclosure

| Check | Sui-specific detail |
|---|---|
| Move object visibility | Objects with `key` ability are readable by anyone via RPC. Do not store secrets in on-chain objects |
| RPC response filtering | Custom indexer responses should not leak internal data (object versions, internal IDs) to unauthorized callers |
| Error message leakage | Move abort codes and error messages should not reveal internal logic. Frontend should display generic errors |
| Wallet address correlation | If privacy matters, warn users that all transactions are public and addresses are linkable |

### Denial of service

| Check | Sui-specific detail |
|---|---|
| Shared object contention | A popular shared object (e.g., a global registry) can become a bottleneck. Consider sharding or owned-object patterns |
| Gas exhaustion via sponsored tx | Unbounded gas sponsorship allows an attacker to drain the sponsor's balance. Set per-tx and per-user gas limits |
| RPC rate limiting | Public RPC endpoints have rate limits. Handle 429 responses gracefully. Use fallback endpoints |
| Walrus storage spam | If the app stores blobs on Walrus, rate-limit blob creation to prevent storage cost attacks |

### Elevation of privilege

| Check | Sui-specific detail |
|---|---|
| Capability object leaks | If an `AdminCap` is passed to a public function by value and returned, an attacker could intercept it mid-PTB |
| Missing ownership checks | Move entry functions that accept object references must verify the caller owns or is authorized for that object |
| Upgrade cap exposure | An exposed `UpgradeCap` allows arbitrary package upgrades. Store it in a multisig-controlled object or destroy it |
| zkLogin scope escalation | Verify that zkLogin proofs are scoped to the intended actions, not reusable across contexts |

## OWASP Top 10 mapped to Sui patterns

| OWASP | Sui equivalent | What to check |
|---|---|---|
| A01: Broken Access Control | Missing capability checks in Move entry functions | Every privileged function must require the correct Cap object |
| A02: Cryptographic Failures | Secrets stored in on-chain objects, weak key derivation | Never store private keys or secrets in Move objects. Use Seal for encrypted data |
| A03: Injection | PTB composition injection, unchecked Move params | Validate all parameters in entry functions. Restrict sponsored PTB commands |
| A04: Insecure Design | No threat model, no abuse cases | Run STRIDE before shipping. Write negative tests for unauthorized access |
| A05: Security Misconfiguration | Default RPC, open CORS, debug mode in prod | Harden RPC config, restrict CORS origins, disable debug endpoints |
| A06: Vulnerable Components | Outdated npm deps, floating Move deps | Pin all dependencies. Run `npm audit`. Verify Move dep package IDs |
| A07: Authentication Failures | Weak zkLogin config, no session expiry | Bound ephemeral key TTL, validate OAuth JWTs, rate-limit auth |
| A08: Integrity Failures | Unsigned upgrades, untrusted CI/CD | Use UpgradeCap policies. Pin CI dependencies. Verify build provenance |
| A09: Logging Failures | No events emitted, no backend logging | Emit Sui events for critical ops. Structured JSON logs for backend |
| A10: SSRF | Backend fetches user-supplied URLs | Allowlist external URLs. Block internal/localhost. Validate URL schemes |

## OWASP API Security Top 10 (quick Sui check)

| # | Vulnerability | Sui check |
|---|---|---|
| API1 | Broken Object Level Auth | Every object access in Move must verify ownership or capability |
| API2 | Broken Authentication | zkLogin TTL bounded, wallet sig verified, rate limiting on auth |
| API3 | Broken Object Property Auth | Shared objects: verify field-level write access, not just object-level |
| API4 | Unrestricted Resource Consumption | Gas limits on sponsored tx, pagination on queries, blob creation limits |
| API5 | Broken Function Level Auth | Admin-only Move functions must require AdminCap, not just address check |
| API6 | Unrestricted Business Flows | Rate-limit minting, claiming, and other value-creation flows |
| API7 | SSRF | Backend URL fetching must allowlist targets |
| API8 | Security Misconfiguration | No debug mode in prod, CORS restricted, error messages generic |
| API9 | Improper Inventory | Document all published packages, track package IDs, version upgrades |
| API10 | Unsafe API Consumption | Validate responses from Walrus, DeepBook, external APIs |
