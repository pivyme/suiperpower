# Requirements Log

Durable steering accumulated during the autonomous build. Append-only, project memory, committed to git.

The orchestrator reads this every iteration and prepends non-promoted entries into each builder subagent's prompt. If an entry belongs in CLAUDE.md or a plan, the builder will promote it and append `(promoted → file)` to the entry.

Add new rules with: `./bigdev/autobuild say "your rule"`

---

