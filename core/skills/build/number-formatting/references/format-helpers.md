# Format helpers, drop-in TS

Place at `web/lib/format.ts` or the project's lib root. Zero runtime deps. Uses `Intl.NumberFormat` for locale-aware grouping and `BigInt` for token math.

```ts
const DEFAULT_LOCALE = "en-US";

export interface FormatTokenOpts {
  symbol?: string;
  maxDecimals?: number;
  trim?: boolean;
  locale?: string;
}

export function formatToken(amount: bigint, decimals: number, opts: FormatTokenOpts = {}): string {
  const {
    symbol,
    maxDecimals = decimals,
    trim = true,
    locale = DEFAULT_LOCALE,
  } = opts;

  const negative = amount < 0n;
  const abs = negative ? -amount : amount;

  const divisor = 10n ** BigInt(decimals);
  const whole = abs / divisor;
  const frac = abs % divisor;

  let fracStr = frac.toString().padStart(decimals, "0");
  if (maxDecimals < decimals) fracStr = fracStr.slice(0, maxDecimals);
  if (trim) fracStr = fracStr.replace(/0+$/, "");

  const wholeStr = new Intl.NumberFormat(locale).format(whole);
  const value = fracStr.length > 0 ? `${wholeStr}.${fracStr}` : wholeStr;
  const signed = negative ? `-${value}` : value;

  return symbol ? `${signed} ${symbol}` : signed;
}

export function formatSui(mist: bigint, opts: FormatTokenOpts = {}): string {
  return formatToken(mist, 9, { symbol: "SUI", maxDecimals: 4, ...opts });
}

export function formatUSD(value: number | string | bigint, decimals = 2, locale = DEFAULT_LOCALE): string {
  const num = typeof value === "bigint" ? Number(value) : Number(value);
  if (!Number.isFinite(num)) return "--";

  const fmt = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return fmt.format(num);
}

export function formatPercent(value: number, decimals = 2, locale = DEFAULT_LOCALE): string {
  if (!Number.isFinite(value)) return "--";
  const fmt = new Intl.NumberFormat(locale, {
    style: "percent",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return fmt.format(value);
}

export function formatGas(mist: bigint): string {
  return `~${formatToken(mist, 9, { symbol: "SUI", maxDecimals: 6 })}`;
}

export function ellipsizeAddress(addr: string, head = 4, tail = 4): string {
  if (!addr || addr.length <= head + tail + 2) return addr;
  return `${addr.slice(0, 2 + head)}...${addr.slice(-tail)}`;
}

export const ellipsizeId = ellipsizeAddress;
```

## Notes

- `formatToken` takes a `bigint` for the amount, NOT a number. Token math at scale overflows JS `Number` past 2^53; always pipe RPC values as `bigint`.
- The thin space before the symbol is ` ` (narrow no-break space). Renders cleaner than a regular space.
- `trim: true` removes trailing zeros after the decimal. Set `trim: false` for table columns where alignment matters.
- `formatSui` defaults to 4 decimals for display readability. Override `maxDecimals: 9` when full precision is needed (e.g. transaction confirmation).
- `formatGas` always shows the tilde to communicate "estimate or rough value", and uses 6 decimals because gas values often have 5-6 significant digits below the unit.
- `ellipsizeAddress` keeps the `0x` prefix in the head count, so the visible head is `0x` + 4 chars by default.

## Tabular figures CSS

Apply at the component level, not globally. Tabular figures look wrong in body prose; they look right in tables, balances, prices.

```css
.tabular {
  font-variant-numeric: tabular-nums;
  font-feature-settings: "tnum" 1;
}
```

Tailwind: `tabular-nums` utility class.

## React hook tip

For long-lived components that format the same value repeatedly:

```ts
import { useMemo } from "react";

export function useFormattedSui(mist: bigint | undefined): string {
  return useMemo(() => (mist === undefined ? "--" : formatSui(mist)), [mist]);
}
```

Avoid memoizing single-call sites; the formatter is cheap.
