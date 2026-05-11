---
name: number-formatting
description: Format token amounts, USD values, percentages, gas, and addresses correctly in a Sui dapp UI, including MIST to SUI conversion. Use when the user says "format numbers in my UI", "convert MIST to SUI", "format token amounts", "decimal handling", "format USD price", "tabular figures", or "my numbers look ugly". Reads .suiperpower/build-context.md if present.
---

## Preamble (run first)

```bash
# Suiperpower telemetry. Routes through the CLI so projects.json + Convex stay in sync.
# Silent on failure so the skill never blocks. Opt out: SUIPERPOWER_TELEMETRY=off.
#
# AGENT NOTE: when this skill finishes, run the matching completion command:
#   suiperpower track number-formatting build completed
# Or use "failed" / "aborted" if it ended that way.
command -v suiperpower >/dev/null 2>&1 && suiperpower track number-formatting build started >/dev/null 2>&1 &
true
```

If `TEL_PROMPTED` is `no`, before doing real work, ask the user:

> Help suiperpower get better. We track which skills get used and how long they take. No code, no file paths, no PII. Change anytime in `~/.suiperpower/config.json`.
>
> A) Sure, anonymous
> B) No thanks

Write the answer to `~/.suiperpower/config.json` `telemetryTier` field and create `~/.suiperpower/.telemetry-prompted`. Then continue.

## What this skill does

Drops in a small set of Sui-aware number formatting helpers and applies them across the UI. Covers token amounts (any decimals, including MIST to SUI), USD values, percentages, gas, balances with thousands separators, and address ellipsis. The goal is one consistent formatter set so prices, balances, and gas all read alike across the app.

Numbers are the most-glanced-at element in a dapp. Getting them wrong (raw MIST to a user, scientific notation in the middle of a price, jiggling proportional figures) is a credibility kill.

## When to use it

- Dapp displays raw MIST anywhere a user can see it.
- Numbers update in place and the columns or values jiggle (proportional figures).
- USD values render with floating decimals (`$1234.567890123`).
- Percentages render without a sign or with too many decimals.
- The user wants a consistent formatting layer instead of inline `Number.toFixed` calls.

## When NOT to use it

- The frontend has not been scaffolded yet, route to `scaffold-project`.
- Pure backend / RPC concern, formatting belongs at the UI layer.
- The Move contract returns raw integers and the user wants to format inside Move (Move should not format strings; do it in TS).

If you activated this and the user actually wants something else, consult `skills/SKILL_ROUTER.md` and hand off.

## Inputs

- The current frontend code (TS or JS).
- The set of coins or tokens the dapp displays, with their decimals.
- Optional: existing formatter utility, if one is already in the codebase (audit and consolidate).

## Outputs

- A `web/lib/format.ts` (or similar location) module exporting:
  - `formatToken(amount: bigint, decimals: number, opts?)`
  - `formatSui(mist: bigint, opts?)` (wrapper for `formatToken(amount, 9, ...)`)
  - `formatUSD(value: number | string, opts?)`
  - `formatPercent(value: number, opts?)`
  - `formatGas(mist: bigint)` (renders `~0.0001 SUI` shape)
  - `ellipsizeAddress(addr: string)` and `ellipsizeId(id: string)`
- Component callsites updated to use the new helpers.
- Tabular-figures CSS applied at the right element scope.

## Workflow

1. **Inventory existing formatting**
   - Grep for `toFixed`, `toLocaleString`, `BigInt`, `MIST`, manual decimals.
   - Note divergent patterns. Pick one canonical shape per surface.

2. **Drop in the formatters**
   - Use the templates in `references/format-helpers.md`.
   - Place under `web/lib/format.ts` (or the project's lib root).

3. **Apply tabular figures**
   - Add `font-feature-settings: "tnum"` (or Tailwind `tabular-nums`) to numeric elements at the component level. Not globally, since tabular figures look wrong in body prose.

4. **Update callsites**
   - Replace inline `(mist / 10n ** 9n).toString()` with `formatSui(mist)`.
   - Replace `value.toFixed(2)` with `formatUSD(value)`.
   - Replace `(rate * 100).toFixed(2) + '%'` with `formatPercent(rate)`.

5. **Address handling**
   - Replace inline `addr.slice(0, 6) + '...' + addr.slice(-4)` with `ellipsizeAddress(addr)`.
   - For Object IDs, package IDs, digests use `ellipsizeId`.

6. **Verification**
   - Test small numbers (0.000001 USDC), large numbers (1,234,567.89 USDC), zero, max u64.
   - Test MIST to SUI conversion with rounding (e.g. 1,234,567,890 MIST renders as 1.234567890 SUI, not scientific).
   - Test that the same number rendered twice in different components looks identical character-for-character.

## Quality gate (anti-slop)

Before reporting done:

- Are there any remaining direct `toFixed` or manual division by 10n ** decimals in the codebase? If yes, the consolidation is incomplete.
- Does every numeric column use tabular figures?
- Do gas, token, and USD values have distinguishable formatting (so users do not confuse 0.001 SUI gas with 0.001 USDC)?
- Do edge cases work (zero, very small, very large, undefined input gracefully renders as "--" or "0")?
- Are addresses and Object IDs both ellipsized with the same head/tail counts?

If any answer is no, the skill keeps working.

## References

On-demand references (load when relevant to the user's question):

- `references/format-helpers.md`: Drop-in TypeScript helpers for tokens, SUI, USD, percent, gas, addresses.
- `references/decimals-by-token.md`: Common Sui-ecosystem coin decimals (SUI, USDC, native sponsor coins).

## Use in your agent

- Claude Code: `claude "/suiper:number-formatting <your message>"`
- Codex: `codex "/number-formatting <your message>"`
- Cursor: paste a chat message that includes a phrase like "format numbers in my UI", or load `~/.cursor/rules/number-formatting.mdc` and reference it.

If you activated this and the user actually wants something else, consult `skills/SKILL_ROUTER.md` and hand off.
