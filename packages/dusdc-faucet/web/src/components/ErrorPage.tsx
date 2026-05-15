import { useState } from 'react'
import { useRouter } from '@tanstack/react-router'
import { Button } from '@heroui/react'
import { AlertTriangle, RefreshCw, Home, Copy, Check, ChevronDown } from 'lucide-react'
import toast from 'react-hot-toast'
import { cnm } from '@/utils/style'

interface ErrorPageProps {
  error?: Error
  reset?: () => void
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  const router = useRouter()
  const [copied, setCopied] = useState(false)
  const [showStack, setShowStack] = useState(false)

  const handleRetry = () => {
    if (reset) {
      reset()
    } else {
      router.invalidate()
    }
  }

  const errorMessage = error?.message || 'Unknown error'
  const errorStack = error?.stack

  const handleCopy = async () => {
    const parts = [
      `Error: ${errorMessage}`,
      `URL: ${window.location.href}`,
      `Time: ${new Date().toISOString()}`,
    ]
    if (errorStack) parts.push(`\nStack:\n${errorStack}`)

    await navigator.clipboard.writeText(parts.join('\n'))
    setCopied(true)
    toast.success('Error details copied', { id: 'error-copy' })
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className={cnm(
        'min-h-screen w-full flex items-center justify-center',
        'bg-neutral-50 dark:bg-neutral-900',
        'px-6 py-20'
      )}
    >
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <div className="mb-6 flex justify-center">
            <div
              className={cnm(
                'w-14 h-14 flex items-center justify-center',
                'border border-amber-200 dark:border-amber-900/50',
                'bg-amber-50 dark:bg-amber-950/30'
              )}
            >
              <AlertTriangle className="w-6 h-6 text-amber-500" />
            </div>
          </div>

          <h1 className="text-xl font-medium text-neutral-900 dark:text-neutral-100 mb-2">
            Something went wrong
          </h1>

          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            An unexpected error occurred. Try refreshing, or head back home.
          </p>
        </div>

        {error && (
          <div
            className={cnm(
              'mb-8 border border-neutral-200 dark:border-neutral-800',
              'bg-neutral-100/50 dark:bg-neutral-800/20',
              'overflow-hidden'
            )}
          >
            <div className="px-4 py-3 flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1.5">
                  Error
                </p>
                <p className="text-xs font-mono text-red-600 dark:text-red-400 break-words leading-relaxed">
                  {errorMessage}
                </p>
              </div>
              <Button
                isIconOnly
                size="sm"
                variant="tertiary"
                className="rounded-none shrink-0 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                onPress={handleCopy}
                aria-label="Copy error details"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-green-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </Button>
            </div>

            {errorStack && (
              <>
                <button
                  onClick={() => setShowStack(!showStack)}
                  className={cnm(
                    'w-full px-4 py-2 flex items-center gap-1.5',
                    'text-[10px] font-mono uppercase tracking-wider text-neutral-400',
                    'border-t border-neutral-200 dark:border-neutral-800',
                    'hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors',
                    'cursor-pointer'
                  )}
                >
                  <ChevronDown
                    className={cnm(
                      'w-3 h-3 transition-transform',
                      showStack && 'rotate-180'
                    )}
                  />
                  Stack trace
                </button>
                {showStack && (
                  <div className="px-4 pb-3 border-t border-neutral-200 dark:border-neutral-800">
                    <pre className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400 whitespace-pre-wrap break-words leading-relaxed max-h-48 overflow-y-auto pt-3">
                      {errorStack}
                    </pre>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        <div className="flex items-center justify-center gap-3">
          <Button
            className={cnm(
              'rounded-none font-mono text-xs',
              'bg-neutral-900 dark:bg-neutral-100',
              'text-neutral-100 dark:text-neutral-900'
            )}
            onPress={handleRetry}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Try again
          </Button>
          <Button
            variant="outline"
            className={cnm(
              'rounded-none font-mono text-xs',
              'border-neutral-300 dark:border-neutral-700',
              'text-neutral-600 dark:text-neutral-400'
            )}
            onPress={() => router.navigate({ to: '/' })}
          >
            <Home className="w-3.5 h-3.5" />
            Go home
          </Button>
        </div>
      </div>
    </div>
  )
}
