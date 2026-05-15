# Requirements Log

Durable steering accumulated during the autonomous build. Append-only, project memory, committed to git.

The orchestrator reads this every iteration and prepends non-promoted entries into each builder subagent's prompt. If an entry belongs in CLAUDE.md or a plan, the builder will promote it and append `(promoted → file)` to the entry.

Add new rules with: `./bigdev/autobuild say "your rule"`

---

- Full autonomy granted for setup tasks. The loop is authorized to generate Sui testnet keypairs, fund them via the testnet faucet, populate `.env` / `backend/.env` / `web/.env` with whatever values are needed (including secrets, for testnet only), and run `bun run scripts/deploy.ts --which=test` itself. Do NOT pause for the user on deploy, wallet generation, env population, db:push, or any other setup-class operation as long as it stays on Sui testnet and uses non-production secrets. Only pause for true blockers (compile errors that cannot be fixed, faucet rate limits that cannot be worked around, missing Sui CLI, etc.). Treat this as the durable steering for the rest of the build.

- Website visual direction (NEW, supersedes the amber-accent palette in `bigdev/plans/04-DESIGN-SYSTEM.md`): match the Suiperpower hero at `/Users/kelvinadithya/Desktop/DEVELOPMENT/SUIPERPOWER/web/app/components/pages/home/hero.tsx`. Black background with a full-bleed animated `GrainGradient` from `@paper-design/shaders-react` (colors `["#155dfc", "#bedbff"]`, colorBack `#000000`, softness 0.5, intensity 0.1, noise 0.07, shape `wave`, speed 0.2, scale 1.5, offsetY 0.3, offsetX 1, opacity ~0.9). Text is white with `text-white/50` for secondary. Surfaces are glass: `bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-md rounded-xl`. Primary CTA / tag is a solid white pill with black text (`bg-white text-black rounded-xl px-5 py-2 font-medium`). Use `motion/react` fade-in-blur entrance animations (`initial: { opacity: 0, filter: 'blur(8px)' }, animate: { opacity: 1, filter: 'blur(0px)' }, transition: { duration: 0.8, delay, ease: 'easeOut' }`) on hero / first-fold elements. Add `motion` and `@paper-design/shaders-react` to `web/package.json` if missing. Theme is dark-only for v1, drop the light-mode toggle. The faucet page must NEVER mention Suiperpower in copy or branding; only the visual language is shared. (promoted → packages/dusdc-faucet/bigdev/plans/04-DESIGN-SYSTEM.md, packages/dusdc-faucet/CLAUDE.md)
