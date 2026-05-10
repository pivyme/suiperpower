---
name: scaffold-project
description: Scaffold a new Sui project with the right stack, write the initial .suiperpower/build-context.md, and pick template defaults. Use when the user says "scaffold my project", "set up my workspace", "what stack should I use on Sui", "init a Sui project", "bootstrap a Sui app", "start a new Sui project", or "give me a Sui template". Reads .suiperpower/idea-context.md if present. Loads skills/data/sui-knowledge/04-protocols-and-sdks.md.
---

## Preamble (run first)

```bash
_TEL_TIER=$(cat ~/.suiperpower/config.json 2>/dev/null | grep -o '"telemetryTier": *"[^"]*"' | head -1 | sed 's/.*"telemetryTier": *"//;s/"$//' || echo "anonymous")
_TEL_TIER="${_TEL_TIER:-anonymous}"
_TEL_PROMPTED=$([ -f ~/.suiperpower/.telemetry-prompted ] && echo "yes" || echo "no")
_TEL_START=$(date +%s)
_SESSION_ID="$$-$(date +%s)"
mkdir -p ~/.suiperpower
echo "TELEMETRY: $_TEL_TIER"
echo "TEL_PROMPTED: $_TEL_PROMPTED"
if [ "$_TEL_TIER" != "off" ]; then
  _TEL_EVENT='{"skill":"scaffold-project","phase":"build","event":"started","ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}'
  echo "$_TEL_EVENT" >> ~/.suiperpower/telemetry.jsonl 2>/dev/null || true
  _CONVEX_URL=$(cat ~/.suiperpower/config.json 2>/dev/null | grep -o '"convexUrl":"[^"]*"' | head -1 | cut -d'"' -f4 || echo "")
  [ -n "$_CONVEX_URL" ] && curl -s -X POST "$_CONVEX_URL/api/mutation" \
    -H "Content-Type: application/json" \
    -d '{"path":"telemetry:track","args":{"skill":"scaffold-project","phase":"build","status":"started","version":"0.1.0","platform":"'$(uname -s)-$(uname -m)'","timestamp":'$(date +%s)000'}}' \
    >/dev/null 2>&1 &
  true
fi
```

If `TEL_PROMPTED` is `no`, before doing real work, ask the user:

> Help suiperpower get better. We track which skills get used and how long they take. No code, no file paths, no PII. Change anytime in `~/.suiperpower/config.json`.
>
> A) Sure, anonymous
> B) No thanks

Write the answer to `~/.suiperpower/config.json` `telemetryTier` field and create `~/.suiperpower/.telemetry-prompted`. Then continue.

## What this skill does

Bootstraps a fresh Sui project on disk. Picks a template based on the project intent (Move-only package, frontend dapp, full-stack with backend), wires the standard Sui dependencies, generates `Move.toml` and `package.json`, and writes the canonical `.suiperpower/build-context.md` so subsequent skills know where the project lives and what stack it uses.

## When to use it

- Starting a new Sui project from scratch.
- Adding a Sui Move package to an existing repo that does not have one yet.
- Migrating an EVM or Solana scaffold to Sui shape.

## When NOT to use it

- If the user has not picked an idea yet, use `find-next-sui-idea` first.
- If the user already has a working project and wants to extend it, use `build-with-move` or the relevant build skill.
- For deploys, use `deploy-to-testnet`.

If you activated this and the user actually wants something else, consult `skills/SKILL_ROUTER.md` and hand off.

## Inputs

- A target directory (default: current working directory).
- Optional: `.suiperpower/idea-context.md` from `find-next-sui-idea`. Read it if present to derive project shape.
- The intended deployment target (testnet first, then mainnet).

If unclear, interview the user for:

- Move-only, frontend-only, or full-stack?
- TS frontend (Next.js, Vite, plain Node) or Rust client?
- Will Walrus, DeepBook, Scallop, or zkLogin be load-bearing? Default these in if so.
- Which package manager (pnpm preferred)?

## Outputs

- A directory with: `move/<package>/Move.toml`, `move/<package>/sources/`, `move/<package>/tests/`, optional `web/`, optional `cli/`, `.suiperpower/build-context.md`, `.gitignore`, `README.md`.
- Initial `.suiperpower/build-context.md` containing:

  ```markdown
  ## scaffold-project session, <timestamp>
  - project name: <name>
  - stack: <move-only | frontend | full-stack>
  - frontend: <none | next | vite>
  - default sponsor integrations: <walrus | deepbook | scallop | none>
  - Move package name: <name>
  - target network: testnet
  - open issues: <list>
  ```

- A working `sui move build` and (if frontend) `pnpm install + pnpm build`.

The skill never deletes files outside the scaffolded directory without explicit user confirmation.

## Workflow

1. **Context gathering**
   - Read `.suiperpower/idea-context.md` if present.
   - Confirm project name, stack shape, sponsor integrations.

2. **Pick the template**
   - Move-only: a single Move package skeleton.
   - Frontend dapp: Next.js + dapp-kit + a Move package.
   - Full-stack: as above plus a backend service shell.

3. **Generate the directory tree**
   - Create directories.
   - Write `Move.toml` with pinned framework rev.
   - Write a placeholder Move module so `sui move build` succeeds.
   - Write a starter test for the placeholder module.

4. **Frontend setup (if applicable)**
   - Scaffold Next.js or Vite.
   - Install `@mysten/sui` and `@mysten/dapp-kit`.
   - Write a starter page that connects to a wallet and reads the user's address.

5. **Sponsor defaults (if applicable)**
   - Add `@mysten/walrus` (or HTTP path) for Walrus.
   - Add `@mysten/deepbook-v3` for DeepBook.
   - Add `@scallop-io/sui-scallop-sdk` for Scallop.
   - Note: do not add unless the user actually plans to use them. Default off.

6. **Quality verification**
   - Run `sui move build`. Confirm zero errors.
   - Run `pnpm install` and a build for frontend, if applicable.

7. **Write build-context.md**
   - Capture stack decisions for downstream skills.

8. **Hand off**
   - Recommend `object-model-design` next if the project has non-trivial state.
   - Recommend `build-with-move` for direct Move authoring.

## Quality gate (anti-slop)

Before reporting done, the skill asks itself the following and refuses to declare success if any answer is no:

- Does `sui move build` succeed in the scaffolded directory with zero errors?
- Does the frontend (if scaffolded) run `pnpm build` without errors?
- Is `Move.toml` pinned to a specific framework rev or tag, not `main`?
- Is `.suiperpower/build-context.md` written with the stack decisions?
- Does the placeholder Move module include at least one passing test?
- Are sponsor defaults only added when the user explicitly opted in, not "just in case"?

If any answer is no, the skill reports the gap and works through it before declaring the project scaffolded.

## References

On-demand references (load when relevant to the user's question):

- `references/template-shapes.md`: Move-only, frontend, full-stack template shapes with file trees.
- `references/move-toml-defaults.md`: Pinned Sui framework rev, package name conventions, edition.

Knowledge docs (load when scope expands beyond what is in references):

- `skills/data/sui-knowledge/04-protocols-and-sdks.md`: SDK ecosystem context, which template fits which intent.

## Use in your agent

- Claude Code: `claude "/scaffold-project <your message>"`
- Codex: `codex "/scaffold-project <your message>"`
- Cursor: paste a chat message that includes a phrase like "scaffold my Sui project", or load `~/.cursor/rules/scaffold-project.mdc` and reference it.

If you activated this and the user actually wants something else, consult `skills/SKILL_ROUTER.md` and hand off.
