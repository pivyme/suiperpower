# CLAUDE.md

You are a senior staff web engineer with a philosophy of dead simplicity, attention to detail, critical thinking, and robustness.

This repo is simple minded - no overengineering, no code poison, no early abstraction, no excessive comments, and no bloat.

---

## Project Overview

This is the **Kwek Labs Web Starter** - a production-ready React web application template built with modern tooling. It's designed as a starting point for new web projects with a focus on performance, developer experience, and clean architecture.

## Tech Stack

- **Framework**: TanStack Start (React 19 meta-framework)
- **Routing**: TanStack Router (file-based routing)
- **State/Data**: TanStack Query for server state
- **Styling**: Tailwind CSS 4 + HeroUI v3 component library
- **Animations**: GSAP + Lenis smooth scroll
- **Build**: Vite 7 + Nitro
- **Language**: TypeScript (strict mode)
- **Package Manager**: bun

## Project Structure

```
src/
├── ui/                   # Flat HeroUI v3 wrappers (Modal, Card, TextField, Tooltip, ...)
├── components/           # Shared components
│   └── elements/         # Reusable UI elements (AnimateComponent, etc.)
├── routes/               # File-based routes (TanStack Router)
│   ├── __root.tsx        # Root layout, providers, meta tags
│   ├── index.tsx         # Home page
│   └── demo/             # Demo routes
├── providers/            # React context providers
│   └── LenisSmoothScrollProvider.tsx
├── hooks/                # Custom React hooks
├── utils/                # Pure helper functions
│   ├── style.ts          # cnm() - clsx + tailwind-merge
│   └── format.ts         # Number/string formatting utilities
├── lib/                  # External integrations (APIs, contracts)
├── integrations/         # Framework integrations
├── data/                 # Static/mock data
├── config.ts             # App configuration constants
├── router.tsx            # Router setup
└── styles.css            # Global styles
```

## Key Files

| File | Purpose |
|------|---------|
| `src/config.ts` | App-wide configuration (links, feature flags) |
| `src/routes/__root.tsx` | Root layout with providers and meta tags |
| `src/components/elements/AnimateComponent.tsx` | GSAP-powered scroll animations |
| `src/components/WebstarterOnboarding.tsx` | Starter template landing page |
| `src/env.ts` | Typed/validated env via `@t3-oss/env-core` + zod. Import from here, not `import.meta.env` |
| `src/utils/style.ts` | `cnm()` utility for className merging |
| `src/utils/format.ts` | Number/currency/date formatting |

## Commands

```bash
bun dev        # Start dev server on port 3200
bun build      # Production build
bun preview    # Preview production build
bun lint       # Run ESLint
bun format     # Run Prettier
bun check      # Format + lint fix
bun test       # Run Vitest tests
```

## Development Guidelines

### Component Organization

1. **Use AnimateComponent for scroll animations**
   ```tsx
   <AnimateComponent onScroll entry="fadeInUp" delay={200}>
     <YourContent />
   </AnimateComponent>
   ```

2. **Use cnm() for conditional classes**
   ```tsx
   import { cnm } from '@/utils/style'

   <div className={cnm(
     'base-classes',
     isActive && 'active-classes',
     variant === 'primary' && 'primary-classes'
   )} />
   ```

3. **HeroUI v3 components — always go through `@/ui/*` wrappers**

   **MANDATORY**: Before writing or modifying any HeroUI v3 code, fetch the current v3 API. v2 patterns (HeroUIProvider, framer-motion, flat props on Card/Modal/TextField, etc.) DO NOT work in v3. Never guess the API from memory.

   - If the `heroui-react` skill is installed, invoke it (it gives you scripts to dump component docs/source/styles).
   - Otherwise, fetch the MDX docs directly: `https://heroui.com/docs/react/components/<component>.mdx` (e.g. `modal.mdx`, `card.mdx`, `text-field.mdx`).

   **Pattern**: We wrap compound HeroUI components in `src/ui/` with flat, single-component APIs so styling changes happen in one place. Use the wrappers for anything we have one, import HeroUI directly only for components without a wrapper yet (Button, Switch, Checkbox, Chip, Slider, Avatar, ProgressBar, Tabs, Popover, etc.).

   **Available wrappers in `src/ui/`:**

   ```tsx
   // Modal — flat, no Backdrop/Container/Dialog/Header/Heading chain
   import { Modal, useOverlayState } from '@/ui/Modal'
   const state = useOverlayState()
   <Modal
     isOpen={state.isOpen}
     onOpenChange={state.setOpen}
     title="Confirm action"
     description="This cannot be undone."
     footer={<Button onPress={state.close}>Close</Button>}
     size="md"            // xs | sm | md | lg | cover | full
     placement="center"   // auto | center | top | bottom
     backdrop="opaque"    // opaque | blur | transparent
     isDismissable
   >
     Body content
   </Modal>

   // Card — title/description/footer flattened
   import { Card } from '@/ui/Card'
   <Card title="Product" description="A great product" footer={<Button>Buy</Button>}>
     content
   </Card>

   // TextField — label/input/description/error flattened, multiline switches to TextArea
   import { TextField } from '@/ui/TextField'
   <TextField
     label="Email"
     description="We never share it."
     error={validationError}        // when truthy, renders as FieldError
     placeholder="you@example.com"
     value={email}
     onChange={setEmail}
     type="email"
     isRequired
   />

   // Tooltip — content as prop, single child as trigger
   import { Tooltip } from '@/ui/Tooltip'
   <Tooltip content="Helpful info" placement="top" showArrow delay={0}>
     <Button>Hover</Button>
   </Tooltip>
   ```

   **Direct HeroUI imports** (no wrapper yet, OK to import from `@heroui/react`):

   ```tsx
   import { Button } from '@heroui/react'
   // v3 variants: primary, secondary, tertiary, outline, ghost, danger
   // No radius prop — use Tailwind classes (e.g. rounded-none)
   // No startContent/endContent — place icons as children
   // Use onPress, not onClick
   ```

   **Adding a new wrapper**: create `src/ui/<Name>.tsx`, flatten the compound API into props, expose every prop the consumer realistically needs. If you find yourself writing the same nested HeroUI structure twice, wrap it.

### Routing (TanStack Router)

- Routes are file-based in `src/routes/`
- Use `createFileRoute` for page components
- Root layout is in `__root.tsx`
- Nested routes use folder structure: `routes/dashboard/settings.tsx` → `/dashboard/settings`

### Styling

- **Tailwind CSS 4** - use `@import "tailwindcss"` syntax
- **Dark theme by default** - neutral color palette
- **Inter Variable font** - imported globally
- Custom scrollbar and selection styles in `styles.css`

### Data Fetching

- Use **TanStack Query** for server state
- Query client is set up in `src/integrations/tanstack-query/`
- Access via `useQuery`, `useMutation` hooks

### Animations

- **GSAP** for complex animations (AnimateComponent)
- **Lenis** for smooth scrolling (auto-initialized in root)
- **Framer Motion** available for component animations

## Code Style

- **TypeScript strict mode** enabled
- **ESLint + Prettier** for formatting
- Import aliases: `@/` maps to `src/`
- No barrel files - import directly from source files
- Keep components focused - extract when reused 2+ times

## Adding New Features

1. **New route**: Create file in `src/routes/` (e.g., `about.tsx` for `/about`)
2. **New component**: Add to `src/components/` (or `elements/` if generic)
3. **New utility**: Add to `src/utils/`
4. **New hook**: Add to `src/hooks/`
5. **API integration**: Add to `src/lib/`

## Common Patterns

### Page with animations
```tsx
import { createFileRoute } from '@tanstack/react-router'
import AnimateComponent from '@/components/elements/AnimateComponent'

export const Route = createFileRoute('/example')({ component: ExamplePage })

function ExamplePage() {
  return (
    <div className="min-h-screen bg-neutral-900">
      <AnimateComponent>
        <h1>Title</h1>
      </AnimateComponent>
      <AnimateComponent onScroll delay={100}>
        <p>Content that animates on scroll</p>
      </AnimateComponent>
    </div>
  )
}
```

### Data fetching
```tsx
import { useQuery } from '@tanstack/react-query'

function MyComponent() {
  const { data, isLoading } = useQuery({
    queryKey: ['items'],
    queryFn: () => fetch('/api/items').then(r => r.json()),
  })

  if (isLoading) return <div>Loading...</div>
  return <div>{data.map(...)}</div>
}
```

## Deployment

- **Vercel**: This is a monorepo, so set the project **Root Directory to `web`** in Vercel settings. Framework preset: Vite. Build command: `bun run build`. Output: `.output`.
- **Other platforms**: Run `bun run build` and deploy `.output/` directory.

## Important Notes

- This uses **TanStack Start** (SSR-capable), not plain Vite React
- HeroUI v3 requires no provider wrapper, CSS handled via `@import "@heroui/styles"` in styles.css
- GSAP is the free version (not Shockingly) - all features available
- Lenis smooth scroll is initialized globally in root layout
- Part of a monorepo. Sibling `backend/` is a Bun + Fastify API on :4127. Wire calls via `VITE_API_URL` from `src/env.ts`. Backend CORS is locked to `ALLOWED_ORIGIN` in production.
- Animation lib `motion` is Motion One (rebranded successor to Framer Motion). Existing Framer Motion docs mostly apply.
