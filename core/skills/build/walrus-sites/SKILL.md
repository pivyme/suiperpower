---
name: walrus-sites
description: Use when publishing a Walrus Site (decentralized website hosted on Walrus).
---

## Preamble (run first)

```bash
# Suiperpower telemetry. Routes through the CLI so projects.json + Convex stay in sync.
# Silent on failure so the skill never blocks. Opt out: SUIPERPOWER_TELEMETRY=off.
#
# AGENT NOTE: when this skill finishes, run the matching completion command:
#   suiperpower track walrus-sites build completed
# Or use "failed" / "aborted" if it ended that way.
command -v suiperpower >/dev/null 2>&1 && suiperpower track walrus-sites build started >/dev/null 2>&1 &
true
```

If `TEL_PROMPTED` is `no`, before doing real work, ask the user:

> Help suiperpower get better. We track which skills get used and how long they take. No code, no file paths, no PII. Change anytime in `~/.suiperpower/config.json`.
>
> A) Sure, anonymous
> B) No thanks

Write the answer to `~/.suiperpower/config.json` `telemetryTier` field and create `~/.suiperpower/.telemetry-prompted`. Then continue.

## What this skill does

Deploys a static frontend (SPA or static-site-generator output) to Walrus Sites so the app is served from decentralized storage at a `*.wal.app` URL. Handles the `site-builder` CLI setup, build output preparation, `ws-resources.json` configuration, deploy command, and optional SuiNS custom subdomain.

## When to use it

- The user wants to host a frontend on Walrus Sites instead of Vercel, Netlify, or similar.
- The user wants a decentralized URL (`*.wal.app`) for their Sui dApp.
- The user already has a static build output (React, Next.js export, Vite, plain HTML) and wants to deploy it.
- The user is targeting the Walrus track at Sui Overflow 2026 and needs decentralized hosting.

## When NOT to use it

- If the user has not picked a project yet, use `find-next-sui-idea` first.
- If the user has not scaffolded a project, use `scaffold-project` first.
- If the user wants to store individual files or blobs on Walrus (not host a site), use `walrus-storage` instead.
- If the user needs server-side rendering (Next.js SSR, API routes, server actions), Walrus Sites cannot do that. Help them pick a hybrid: SSR on a traditional host, static shell on Walrus Sites, or restructure as a pure SPA.
- If the user wants to encrypt stored data, use `seal-access-control` with `walrus-storage`. Walrus Sites content is public.

If you activated this and the user actually wants something else, consult `skills/SKILL_ROUTER.md` and hand off.

## Inputs

- A project with a static build output directory (`dist/`, `build/`, `out/`, or similar).
- Optional: `.suiperpower/build-context.md` from `scaffold-project`. Read it if present.
- A funded Sui wallet with SUI for gas and WAL tokens for storage.

If unclear, interview the user for:

- What framework produces the build? (React/Vite, Next.js static export, plain HTML)
- Where is the build output directory?
- Does the app use client-side routing (SPA)? If yes, a catch-all route is needed.
- How long should the site stay live? (epoch count, 14 days per epoch on mainnet, max ~2 years)
- Do they want a custom SuiNS name (`<name>.wal.app`) or the default Base36 subdomain?

## Outputs

- `site-builder` installed via `suiup`.
- A production build of the frontend pointing at the correct output directory.
- `ws-resources.json` at the project root (or build root) with routes, headers, and optional redirects.
- A deployed Walrus Sites Object with a live `*.wal.app` URL.
- Append to `.suiperpower/build-context.md`:

  ```markdown
  ## walrus-sites session, <timestamp>
  - site object id: <0x...>
  - url: <base36>.wal.app
  - suins name: <name>.wal.app or none
  - epochs: <n>
  - build dir: <path>
  - framework: <vite | next-export | plain-html | other>
  - spa routing: <yes, catch-all configured | no>
  - open issues: <list>
  ```

## Workflow

1. **Context gathering**
   - Read `.suiperpower/build-context.md` if it exists.
   - Confirm the framework, the build command, and the output directory.
   - Confirm the app is static-only (no SSR, no API routes). If it is not, explain the constraint and help restructure or pick an alternative.

2. **Install site-builder**
   - Install via `suiup install site-builder@mainnet` (or `@testnet` for testnet deploys).
   - Verify the binary is on `$PATH`: `site-builder --help`.
   - If the user does not have `suiup`, install it first: `curl -sSfL https://raw.githubusercontent.com/MystenLabs/suiup/main/install.sh | sh` then restart shell.

3. **Prepare the build**
   - Run the project's build command (`npm run build`, `pnpm build`, etc.).
   - Verify `index.html` exists in the output directory. Walrus Sites requires it.
   - If the project uses client-side routing (React Router, Vue Router, TanStack Router), create `ws-resources.json` with a catch-all route: `"/*": "/index.html"`.

4. **Configure ws-resources.json**
   - Place `ws-resources.json` in the build output directory (same level as `index.html`).
   - Add `routes` for SPA catch-all if needed.
   - Add `headers` for cache control on static assets (JS, CSS, images).
   - Add `redirects` for any legacy paths.
   - See `references/walrus-sites-quickstart.md` for the full config shape.

5. **Deploy**
   - First deploy: `site-builder deploy --epochs <N> <BUILD_DIR>`.
   - Update existing site: same command if `ws-resources.json` has `object_id` set from a prior deploy.
   - Capture the site Object ID from the output.

6. **Get the URL**
   - Run `site-builder convert <OBJECT_ID>` to get the Base36 subdomain.
   - The live URL is `https://<base36>.wal.app`.
   - Open it in a browser and verify the site loads.

7. **Optional: SuiNS custom name**
   - If the user owns a SuiNS name, they can point it at the site Object for `<name>.wal.app`.
   - This is a convenience step. The Base36 URL always works.

8. **Writeback**
   - Append session details to `.suiperpower/build-context.md`.

9. **Closing handoff**
   - If `.suiperpower/intent.md` exists and the session was non-trivial (new module, new sponsor integration, or material changes to public functions), recommend `verify-against-intent` as the next step so drift is caught before shipping.
   - If no `intent.md` exists and the session was non-trivial, surface that gap once: offer `clarify-intent` to backfill, do not force it.

## Quality gate (anti-slop)

Before reporting done, the skill asks itself the following and refuses to declare success if any answer is no:

- Does the deployed URL actually load in a browser and render the expected content?
- Is the build output directory correct (not the project root, not `src/`)?
- Does `index.html` exist in the deployed directory?
- If the app uses client-side routing, is the catch-all route (`/*` to `/index.html`) configured in `ws-resources.json`?
- Was the epoch count explicitly chosen by the user, not silently defaulted?
- Is the site Object ID recorded in `build-context.md` so the user can update or destroy later?
- If the framework uses SSR or API routes, was the user warned and the build adjusted to static export?

If any answer is no, the skill reports the gap and works through it before claiming the deploy is complete.

## References

On-demand references (load when relevant to the user's question):

- `references/walrus-sites-quickstart.md`: site-builder CLI commands, ws-resources.json config shape, deploy flow, SuiNS setup.
- `references/walrus-sites-pitfalls.md`: Common mistakes with Walrus Sites deploys and how to avoid them.

External docs (fetch at runtime for the latest CLI flags and config):

- Walrus Sites docs: https://docs.wal.app/walrus-sites/overview.html
- site-builder CLI: https://docs.wal.app/walrus-sites/tutorial.html

## Use in your agent

- Claude Code: `claude "/suiper:walrus-sites <your message>"`
- Codex: `codex "/walrus-sites <your message>"`
- Cursor: paste a chat message that includes a phrase like "host on Walrus" or "deploy to wal.app", or load `~/.cursor/rules/walrus-sites.mdc` and reference it.

If you activated this and the user actually wants something else, consult `skills/SKILL_ROUTER.md` and hand off.
