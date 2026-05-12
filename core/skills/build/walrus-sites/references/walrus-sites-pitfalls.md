# Walrus Sites pitfalls

## Deploying the wrong directory

The most common mistake. Point `site-builder deploy` at the **build output** (`dist/`, `build/`, `out/`), not the project root. If you deploy the root, you publish `node_modules`, `src/`, config files, and everything else. The site will not work and you waste WAL tokens.

## Missing index.html

Walrus Sites requires `index.html` in the root of the deployed directory. If your framework outputs to a subdirectory or names the file differently, the deploy succeeds but the site returns a 404. Verify the file exists before deploying.

## SPA deep links return 404

If your app uses client-side routing and you skip the `routes` config in `ws-resources.json`, refreshing any non-root path returns 404. Fix: add `"/*": "/index.html"` to routes.

## content-type header must be lowercase

Custom headers in `ws-resources.json` are case-sensitive. `Content-Type` (capital C, capital T) does not work. Use `content-type` (all lowercase) if you need to set it manually. In most cases, site-builder infers the correct content type from file extensions, so you should not need to set it.

## Epoch expiry

Site storage is not permanent by default. Each epoch is 14 days on mainnet. If you deploy with `--epochs 5`, the site disappears after ~70 days. Plan accordingly. Max is ~53 epochs (~2 years). There is no auto-renewal; you must redeploy or extend before expiry.

## SSR and API routes are not supported

Walrus Sites serves static files only. If your Next.js project uses `getServerSideProps`, API routes, or server actions, those will not work. Switch to `output: 'export'` in `next.config.js` for a static export, or host the server portion elsewhere and use Walrus Sites for the static shell only.

## Network mismatch

If you installed `site-builder@testnet` but your wallet is configured for mainnet (or vice versa), the deploy fails or creates a site on the wrong network. Match the site-builder version to the Sui client active network.

## Destroying is permanent

`site-builder destroy --id <OBJECT_ID>` permanently removes the site. There is no undo, no soft delete. Double-check the Object ID before running this. You can always redeploy, but the Object ID and URL will change.

## WAL token balance

Storage costs WAL tokens, not SUI. If you have SUI but no WAL, the deploy fails. On testnet, request WAL from the faucet. On mainnet, acquire WAL through the Walrus exchange or a DEX.
