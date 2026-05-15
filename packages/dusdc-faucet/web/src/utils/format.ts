export const formatStringToNumericDecimals = (
  val: string,
  maxDecimals: number = 6,
): string => {
  const cleanedValue = val.replace(/[^0-9.]/g, '')
  const parts = cleanedValue.split('.')

  if (parts.length > 2) {
    return parts.slice(0, 2).join('.')
  }

  parts[0] = parts[0].replace(/^0+(?=\d)/, '')

  if (parts[0] === '') {
    parts[0] = '0'
  }

  if (parts[1] !== undefined) {
    parts[1] = parts[1].substring(0, maxDecimals)
  }

  const formattedIntegerPart = parts[0]
    .split('')
    .reverse()
    .join('')
    .replace(/(\d{3}(?!$))/g, '$1,')
    .split('')
    .reverse()
    .join('')

  return formattedIntegerPart + (parts[1] !== undefined ? `.${parts[1]}` : '')
}

export const serializeFormattedStringToFloat = (val: string): number => {
  try {
    return parseFloat(val.replace(/,/g, ''))
  } catch {
    return 0
  }
}

export const formatNumberToKMB = (num: number): string => {
  try {
    if (num >= 1_000_000_000) {
      return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B'
    }
    if (num >= 1_000_000) {
      return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M'
    }
    if (num >= 1_000) {
      return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K'
    }
    return num.toString()
  } catch {
    return '-'
  }
}

export interface FormatOptions {
  round?: boolean
  exactDecimals?: boolean
  maxDecimals?: number
  defaultDecimals?: number
  humanize?: boolean
  humanizeThreshold?: number
}

const formatNumeral = (value: number, formatStr: string): string => {
  if (formatStr === '0.[00]a') {
    if (value >= 1_000_000_000) {
      return `${(value / 1_000_000_000).toFixed(2).replace(/\.?0+$/, '')}b`
    }
    if (value >= 1_000_000) {
      return `${(value / 1_000_000).toFixed(2).replace(/\.?0+$/, '')}m`
    }
    if (value >= 1_000) {
      return `${(value / 1_000).toFixed(2).replace(/\.?0+$/, '')}k`
    }
    return value.toString()
  }
  return value.toString()
}

export const formatUiNumber = (
  num: number | string,
  currency: string = '',
  options: FormatOptions = {},
): string => {
  try {
    const {
      round = false,
      exactDecimals = false,
      maxDecimals = 9,
      defaultDecimals = 2,
      humanize = false,
      humanizeThreshold = 10000,
    } = options

    const value = typeof num === 'string' ? parseFloat(num) : num || 0
    const currencyStr = currency ? ` ${currency.trim()}` : ''

    if (Math.abs(value) < 1e-9) {
      return defaultDecimals && maxDecimals !== 0
        ? `0.${'0'.repeat(Math.min(defaultDecimals, maxDecimals))}${currencyStr}`
        : `0${currencyStr}`
    }

    if (Math.abs(value) < 1e-6) {
      return `${value.toExponential(2)}${currencyStr}`
    }

    if (humanize && Math.abs(value) >= humanizeThreshold) {
      return `${formatNumeral(value, '0.[00]a')}${currencyStr}`
    }

    if (exactDecimals) {
      const stringValue = value.toString()
      if (stringValue.includes('.')) {
        const [wholePart, decimalPart] = stringValue.split('.')
        const formattedWholePart = wholePart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
        const trimmedDecimalPart = decimalPart.slice(0, maxDecimals).replace(/0+$/, '')
        return trimmedDecimalPart
          ? `${formattedWholePart}.${trimmedDecimalPart}${currencyStr}`
          : `${formattedWholePart}${currencyStr}`
      }
      return `${value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}${currencyStr}`
    }

    if (round) {
      const significantFigures = value > 1_000_000 ? 10 : 5
      return `${value.toPrecision(significantFigures).replace(/\.?0+$/, '')}${currencyStr}`
    }

    let decimalsToShow = defaultDecimals !== undefined ? defaultDecimals : 2

    if (Math.abs(value) < 1 && Math.abs(value) > 0) {
      const valueStr = value.toString()
      if (valueStr.includes('e-')) {
        const exponent = parseInt(valueStr.split('e-')[1])
        decimalsToShow = Math.min(Math.max(exponent, decimalsToShow), maxDecimals)
      } else if (valueStr.includes('.')) {
        const decimalPart = valueStr.split('.')[1]
        let leadingZeros = 0
        for (let i = 0; i < decimalPart.length; i++) {
          if (decimalPart[i] === '0') {
            leadingZeros++
          } else {
            break
          }
        }
        decimalsToShow = Math.min(Math.max(leadingZeros + 1, decimalsToShow), maxDecimals)
      }
    }

    const fixedValue = value.toFixed(decimalsToShow)
    const [wholePart, decimalPart] = fixedValue.split('.')
    const formattedWholePart = wholePart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    const trimmedDecimalPart = decimalPart ? decimalPart.replace(/0+$/, '') : ''

    return trimmedDecimalPart
      ? `${formattedWholePart}.${trimmedDecimalPart}${currencyStr}`
      : `${formattedWholePart}${currencyStr}`
  } catch {
    const fallbackValue = num?.toString() || '0'
    return currency ? `${fallbackValue} ${currency.trim()}` : fallbackValue
  }
}

export const capitalizeFirstLetter = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function unsluggify(slug: string, separator: string = '-'): string {
  return slug
    .split(separator)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}
