# Time-to-first-value benchmarks

Targets for time from landing page load to the user receiving the first concrete output. Concrete means a transaction confirmed, a price quoted, a piece of content rendered, an answer returned. Sitting on an empty dashboard is not concrete value.

Numbers are pragmatic targets, not theoretical ceilings. Hitting them puts the product ahead of the typical first-time user experience for the category.

## Categories

### DEX or trading frontend

- Target: under 30 seconds from landing to a working price quote.
- Includes: wallet connect, network switch (if needed), token list load, quote fetch.
- Stretch: under 15 seconds with a "try without connecting" preview.
- Common drag: token list lazy-load, wallet connect modal that hides itself, RPC cold start.

### Money market or lending app

- Target: under 45 seconds from landing to a populated user portfolio view.
- Includes: wallet connect, Scallop or equivalent fetch, position rendering.
- Common drag: empty state shown for too long without a "start by depositing" CTA, market data fetch sequenced after portfolio fetch instead of parallel.

### NFT or kiosk marketplace

- Target: under 20 seconds from landing to a browsable collection grid.
- Includes: image CDN warm, collection metadata fetch.
- Common drag: hero carousel that blocks the grid, image loading without skeletons, kiosk listing fetch that is not paginated.

### Social or content app

- Target: under 10 seconds from landing to a populated feed (read-only OK).
- Includes: feed query, first image render.
- Common drag: zkLogin redirect on landing, feed query that does not return until full pagination resolves.

### Indexer or dashboard

- Target: under 15 seconds from landing to a populated chart.
- Includes: query API call, chart render.
- Common drag: chart library hydrating before data arrives, default time range that requires too much data.

### Pure utility (faucet, deployer, signer tool)

- Target: under 5 seconds from landing to "ready to act".
- Common drag: unnecessary onboarding screens, "welcome" modal, marketing copy.

### Walrus-backed app (storage, content, blob)

- Target: under 25 seconds from landing to a retrieved blob rendered.
- Includes: aggregator fetch, decode, render.
- Common drag: aggregator selection that is sequential instead of parallel, missing CDN caching.

## Measurement rules

- Measure with a fresh browser session. No cached state, no warm wallet.
- Throttle the network to "Fast 3G" if the target user is mobile.
- Record the time to the first concrete output, not the first paint.
- Average over three runs. Use the median.

## Interpretation

- Within target: pass.
- Up to 2x target: medium-impact finding. P1 in the roadmap.
- Above 2x target: high-impact finding. P0 regardless of cause.
- Above 4x target: the product likely has a foundational performance issue. Recommend a separate performance review before shipping.

## What this benchmark is NOT

- Not a marketing claim ("we are the fastest"). It is a guardrail.
- Not a one-off measurement. Re-run after every release that touches the load path.
- Not a substitute for actual user observation. A user who finds value in 15 seconds but cannot articulate why is still a sign of clear product fit.
