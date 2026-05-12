# Security policy

## Reporting a vulnerability

Do not open a public GitHub issue. Use one of the private channels below.

1. **GitHub private vulnerability report (preferred):** https://github.com/pivyme/suiperpower/security/advisories/new
2. **Email:** admin@pivy.me with subject `[suiperpower security]`

Include:

- A short description of the issue and the impact you believe it has.
- Steps to reproduce, a proof of concept, or affected code paths.
- Your suggested fix, if you have one.
- Whether you want public credit and under what name.

We aim to acknowledge a report within 72 hours and provide a substantive response within 7 days. Coordinated disclosure timelines are negotiable case by case; default target is 90 days from acknowledgement.

## What's in scope

- The published `suiperpower` npm package and its install flow (`install.sh`).
- The CLI code under `core/`.
- The Convex backend code under `convex/` and its public functions.
- The website under `web/` (https://suiperpower.dev).
- Skill content under `core/skills/` that could lead an AI agent to produce dangerous code.

## What's out of scope

- Social engineering of maintainers.
- Issues in third-party services we depend on (Convex, Vercel, GitHub). Report those upstream.
- Bugs in code that an AI agent generates while using a skill, unless the skill itself instructed the agent to write the bug.
- Denial of service via standard rate-limiting bypass on public endpoints.
- Findings from automated scanners without a working PoC.

## Safe harbor

We will not pursue legal action against researchers who:

- Test only against accounts they own or have explicit permission to test.
- Avoid privacy violations, data destruction, and service degradation.
- Give us reasonable time to fix before disclosing publicly.

Thank you for helping keep Suiperpower and its users safe.
