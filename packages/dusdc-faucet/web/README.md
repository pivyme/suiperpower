# Kwek Labs Web Starter v2

Production-ready React 19 template with TanStack Start, HeroUI v3, and modern tooling.

## Tech Stack

- React 19 + TanStack Start (SSR meta-framework)
- TanStack Router (file-based routing)
- TanStack Query (server state)
- Tailwind CSS 4 + HeroUI v3
- GSAP + Lenis (animations, smooth scroll)
- Vite 7 + Nitro (build, server)
- TypeScript (strict mode)
- Bun (package manager)

## Project Structure

```
src/
  components/        Shared components
    elements/        Reusable UI elements (AnimateComponent)
    art/             Generative art components
  routes/            File-based routes (TanStack Router)
  providers/         React context providers (Theme, Lenis)
  hooks/             Custom React hooks
  utils/             Pure helpers (cnm, format, motion)
  integrations/      Framework integrations (TanStack Query)
  lib/               External integrations
  config.ts          App configuration constants
  env.ts             Type-safe env vars (t3-env)
  router.tsx         Router setup
  styles.css         Global styles
```

## Setup

```bash
git clone <repo-url>
cd web-starter-v2
cp .env.example .env
bun install
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_APP_TITLE` | No | App display name |
| `VITE_APP_URL` | No | App base URL |
| `VITE_API_URL` | No | Backend API URL |
| `VITE_API_KEY` | No | API key for backend |
| `SERVER_URL` | No | Server-side only URL (not exposed to client) |

All env vars are optional. The app runs with zero configuration.

## Development

```bash
bun dev          # Dev server on port 3200
bun build        # Production build
bun preview      # Preview production build
bun lint         # ESLint
bun format       # Prettier
bun check        # Format + lint fix
bun test         # Vitest
```

## Routing

Routes are file-based in `src/routes/`. Add a file, get a route.

- `src/routes/index.tsx` -> `/`
- `src/routes/about.tsx` -> `/about`
- `src/routes/dashboard/settings.tsx` -> `/dashboard/settings`

Root layout is in `src/routes/__root.tsx`.

## Key Patterns

**Scroll animations:**
```tsx
<AnimateComponent onScroll entry="fadeInUp" delay={200}>
  <YourContent />
</AnimateComponent>
```

**Class merging:**
```tsx
import { cnm } from '@/utils/style'
<div className={cnm('base', isActive && 'active')} />
```

**HeroUI v3 components (composable API):**
```tsx
import { Button, Tabs, Tab, Switch } from '@heroui/react'
```

**Environment variables:**
```tsx
import { env } from '@/env'
console.log(env.VITE_APP_TITLE)
```

## Deployment (Vercel)

Push to main. Vercel auto-detects the Nitro preset.

No `vercel.json` needed. Nitro handles routing.

Build output goes to `.output/`.

## Notes

- TanStack Start uses Nitro for SSR. This is not a plain SPA.
- `nitro` is pinned to nightly builds (required by TanStack Start currently).
- HeroUI v3 uses a composable API with dot notation (`Tabs.List`, `Switch.Control`, etc.).
- Dark theme is default. Theme toggle is in the header.
- GSAP is the free version. All features available.
