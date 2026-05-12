# @suiperpower/web

Marketing site and skills catalog for Suiperpower. Live at [suiperpower.dev](https://suiperpower.dev).

This package is one of three in the monorepo. The CLI lives in [`core/`](../core), the telemetry backend in [`convex/`](../convex). For project-wide context read the root [README.md](../README.md) and [CLAUDE.md](../CLAUDE.md).

## Stack

- React Router v7 (Remix successor) with SSR + prerender
- Vite 8
- Tailwind CSS v4
- TypeScript strict, ESM, NodeNext
- Node.js 20+
- Containerized via `Dockerfile`, deployed on Vercel

## Routes

| Path | File | What it is |
|---|---|---|
| `/` | `app/routes/home.tsx` | Landing page, install one-liner, skill index, team |
| `/skills` | `app/routes/skills.tsx` | Browsable catalog with per-skill detail and tarball downloads |

## Local development

Run everything from the repo root. The `web` scripts proxy to the workspace.

```bash
pnpm install
pnpm web:dev      # http://localhost:5173
```

`pnpm web:dev` runs `predev` first, which invokes `pnpm -F suiperpower package:skills`. That rebuilds the tarballs under `public/skills/` and the index JSONs the site loads at runtime. You get fresh artifacts every boot without thinking about it.

If you are editing skills under `core/skills/` while the dev server is running, open a second terminal:

```bash
pnpm skills:watch   # rebuilds artifacts on every save, debounced 400ms
```

The dev server picks up regenerated tarballs and indexes without a restart.

## Build

```bash
pnpm web:build      # runs prebuild (package:skills), then react-router build
pnpm -F @suiperpower/web start   # serve the built output locally
```

Output lands in `web/build/`:

```text
build/
├── client/    # static assets (hashed)
└── server/    # SSR bundle
```

## Skills artifact pipeline

The site reads three sets of artifacts that are generated, not authored:

```text
web/public/skills/*.tar.gz       # one per skill, served as downloads
web/public/skills/index.json     # public manifest fetched at runtime
web/app/data/skills-index.json   # checked-in mirror for SSR / build-time use
```

All three are written by `pnpm package:skills` (which calls `core/scripts/package-skills.sh` and `core/scripts/generate-skills-index.ts`). The `predev` and `prebuild` hooks in this package's `package.json` run that command automatically, so Vercel deploys and local boots always get fresh data.

Do not commit stale tarballs or indexes. If a skill is missing from the live site, run `pnpm package:skills` once and reload. CI does not currently regenerate.

## Typecheck

```bash
pnpm -F @suiperpower/web typecheck
```

Runs `react-router typegen` to refresh route types, then `tsc`.

## Docker

```bash
docker build -t suiperpower-web .
docker run -p 3000:3000 suiperpower-web
```

Targets any container platform (Vercel, Fly.io, Cloud Run, Railway, etc.).

## Project layout

```text
web/
├── app/
│   ├── components/    # UI primitives + sections
│   ├── data/          # checked-in mirror of skills-index.json
│   ├── routes/        # React Router v7 file routes
│   ├── app.css        # Tailwind entry
│   ├── config.ts      # public site config (URLs, brand)
│   ├── root.tsx       # root layout + meta
│   └── routes.ts      # route manifest
├── public/            # static assets, including generated skills/*.tar.gz
├── Dockerfile
├── react-router.config.ts
├── vite.config.ts
└── tsconfig.json
```

## Conventions

Follow the project-wide rules in [CLAUDE.md](../CLAUDE.md):

- No em-dashes, commas or periods instead.
- No emojis in product copy unless the user explicitly asked for them.
- Capitalize Sui-specific terms (Move, Object, PTB, Walrus, DeepBook, Scallop, Kiosk, zkLogin).
- Senior-friend voice. No "leverage", "cutting-edge", "world-class", "AI-powered", "Web3".
- Strict TypeScript, no implicit any.

## License

[MIT](../LICENSE)
