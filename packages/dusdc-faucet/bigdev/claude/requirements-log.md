# Requirements Log

Durable steering accumulated during the autonomous build. Append-only, project memory, committed to git.

The orchestrator reads this every iteration and prepends non-promoted entries into each builder subagent's prompt. If an entry belongs in CLAUDE.md or a plan, the builder will promote it and append `(promoted → file)` to the entry.

Add new rules with: `./bigdev/autobuild say "your rule"`

---

- Full autonomy granted for setup tasks. The loop is authorized to generate Sui testnet keypairs, fund them via the testnet faucet, populate `.env` / `backend/.env` / `web/.env` with whatever values are needed (including secrets, for testnet only), and run `bun run scripts/deploy.ts --which=test` itself. Do NOT pause for the user on deploy, wallet generation, env population, db:push, or any other setup-class operation as long as it stays on Sui testnet and uses non-production secrets. Only pause for true blockers (compile errors that cannot be fixed, faucet rate limits that cannot be worked around, missing Sui CLI, etc.). Treat this as the durable steering for the rest of the build.
