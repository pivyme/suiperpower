# Walrus Sites quickstart

## Install site-builder

```bash
# Install via suiup (recommended)
suiup install site-builder@mainnet

# Verify
site-builder --help
```

If `suiup` is not installed: `curl -sSfL https://raw.githubusercontent.com/MystenLabs/suiup/main/install.sh | sh`, restart your shell, then run the install above.

## Deploy a site (first time)

```bash
# Build your project first
npm run build          # or pnpm build, etc.

# Deploy the build output directory
site-builder deploy --epochs 5 ./dist
```

The `--epochs` flag sets how long the site stays live. On mainnet, one epoch is 14 days. Max is ~53 epochs (~2 years). WAL tokens pay for storage, SUI pays for gas.

Capture the site Object ID from the output. You need it for updates, URL conversion, and teardown.

## Update an existing site

Add the `object_id` to `ws-resources.json`:

```json
{
  "object_id": "0x<your-site-object-id>"
}
```

Then run the same deploy command. The site-builder detects `object_id` and updates rather than creating a new site.

```bash
site-builder deploy --epochs 5 ./dist
```

## Get the site URL

```bash
site-builder convert <OBJECT_ID>
```

This outputs a Base36 subdomain. Your site is live at `https://<base36>.wal.app`.

## ws-resources.json (full config)

Place this file in the build output directory, next to `index.html`.

```json
{
  "object_id": "0x<site-object-id-after-first-deploy>",
  "site_name": "My Sui App",
  "routes": {
    "/*": "/index.html"
  },
  "headers": {
    "/assets/*": {
      "Cache-Control": "max-age=31536000"
    },
    "/*.html": {
      "Cache-Control": "no-cache"
    }
  },
  "redirects": {
    "/old-path": {
      "target": "/new-path",
      "status": 301
    }
  }
}
```

**Fields:**

| Field | Required | Purpose |
|---|---|---|
| `object_id` | After first deploy | Tells site-builder to update, not create |
| `site_name` | No | Human-readable label |
| `routes` | If SPA | Maps URL patterns to files. `/*` catch-all is essential for SPAs |
| `headers` | No | Custom response headers per path pattern. `content-type` must be lowercase |
| `redirects` | No | HTTP redirects with status codes (301, 302) |

## SPA routing

Single-page apps (React Router, Vue Router, TanStack Router) need a catch-all so that deep links work. Without it, refreshing `/dashboard` returns a 404 because there is no `dashboard/index.html` on Walrus.

```json
{
  "routes": {
    "/*": "/index.html"
  }
}
```

This sends all unmatched paths to `index.html`, where the client-side router takes over.

## Other CLI commands

```bash
# List all resources in a deployed site
site-builder sitemap --id <OBJECT_ID>

# Permanently destroy a site (irreversible)
site-builder destroy --id <OBJECT_ID>
```

## Custom domain via SuiNS

If you own a SuiNS name, point it at the site Object to get a readable URL: `<name>.wal.app`. The mainnet portal is `wal.app`. The Base36 subdomain always works as a fallback.

## Requirements checklist

- `index.html` must exist in the deploy directory
- Build output directory only (not project root)
- Static files only (no SSR, no API routes, no server functions)
- All content is public (Walrus Sites has no access control layer)
- WAL tokens for storage payment, SUI for gas
- Active Sui wallet configured in the local Sui client
