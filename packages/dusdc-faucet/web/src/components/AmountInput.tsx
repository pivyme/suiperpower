import { useEffect, useState } from 'react'
import { cnm } from '@/utils/style'
import { formatDecimal, parseDecimal } from '@/lib/sui/format'

export interface AmountInputProps {
  value: bigint
  onChange: (next: bigint) => void
  unit: 'SUI' | 'DUSDC'
  decimals: number
  max?: bigint
  placeholder?: string
  disabled?: boolean
  error?: string | null
  label?: string
  id?: string
}

// Controlled numeric input, stores the user's literal string so trailing dots
// and zeros do not get clobbered by bigint round-trips.
export function AmountInput({
  value,
  onChange,
  unit,
  decimals,
  max,
  placeholder = '0.0',
  disabled = false,
  error = null,
  label,
  id,
}: AmountInputProps) {
  const [text, setText] = useState<string>(() => formatDecimal(value, decimals))

  // Sync from outside when the parent forces a value (e.g., MAX or reset).
  useEffect(() => {
    const parsed = (() => {
      try {
        return parseDecimal(text, decimals)
      } catch {
        return null
      }
    })()
    if (parsed === null || parsed !== value) {
      setText(formatDecimal(value, decimals))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  const onInput = (raw: string) => {
    // Allow empty, digits, and one decimal point.
    if (raw === '' || /^\d*\.?\d*$/.test(raw)) {
      setText(raw)
      try {
        onChange(parseDecimal(raw, decimals))
      } catch {
        onChange(0n)
      }
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {label ? (
        <label htmlFor={id} className="text-xs text-neutral-500">
          {label}
        </label>
      ) : null}
      <div
        className={cnm(
          'flex items-center gap-3 px-4 h-14 rounded-lg transition-colors',
          'bg-neutral-950 border',
          error
            ? 'border-red-400'
            : 'border-neutral-800 focus-within:border-amber-400',
          disabled && 'opacity-50 cursor-not-allowed',
        )}
      >
        <input
          id={id}
          inputMode="decimal"
          autoComplete="off"
          spellCheck={false}
          value={text}
          onChange={(e) => onInput(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={cnm(
            'flex-1 bg-transparent text-xl font-mono text-neutral-50',
            'placeholder:text-neutral-700 outline-none',
            '[appearance:textfield] [-moz-appearance:textfield]',
            '[&::-webkit-outer-spin-button]:appearance-none',
            '[&::-webkit-inner-spin-button]:appearance-none',
          )}
        />
        <span className="text-sm text-neutral-400 font-medium">{unit}</span>
        {max !== undefined && max > 0n && !disabled ? (
          <button
            type="button"
            onClick={() => {
              const s = formatDecimal(max, decimals)
              setText(s)
              onChange(max)
            }}
            className="text-xs font-medium text-amber-400 hover:text-amber-300 transition-colors"
          >
            MAX
          </button>
        ) : null}
      </div>
      {error ? (
        <p role="alert" className="text-xs text-red-400">
          {error}
        </p>
      ) : null}
    </div>
  )
}
