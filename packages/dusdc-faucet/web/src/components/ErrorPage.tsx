import { useState } from 'react'
import { useRouter } from '@tanstack/react-router'
import { Button } from '@heroui/react'
import { AlertTriangle, Check, ChevronDown, Copy, Home, RefreshCw } from 'lucide-react'
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
    <div className="min-h-screen w-full flex items-center justify-center bg-black text-white px-6 py-20">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <div className="mb-6 flex justify-center">
            <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
          </div>

          <h1 className="text-xl font-medium text-white mb-2">
            Something went wrong
          </h1>

          <p className="text-sm text-white/50">
            An unexpected error occurred. Try refreshing, or head back home.
          </p>
        </div>

        {error && (
          <div className="mb-8 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md overflow-hidden">
            <div className="px-4 py-3 flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-mono uppercase tracking-wider text-white/40 mb-1.5">
                  Error
                </p>
                <p className="text-xs font-mono text-red-400/80 break-words leading-relaxed">
                  {errorMessage}
                </p>
              </div>
              <Button
                isIconOnly
                size="sm"
                variant="tertiary"
                className="rounded-lg shrink-0 text-white/50 hover:text-white"
                onPress={handleCopy}
                aria-label="Copy error details"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-white" />
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
                    'text-[10px] font-mono uppercase tracking-wider text-white/40',
                    'border-t border-white/10',
                    'hover:text-white/80 transition-colors',
                    'cursor-pointer',
                  )}
                >
                  <ChevronDown
                    className={cnm(
                      'w-3 h-3 transition-transform',
                      showStack && 'rotate-180',
                    )}
                  />
                  Stack trace
                </button>
                {showStack && (
                  <div className="px-4 pb-3 border-t border-white/10">
                    <pre className="text-[11px] font-mono text-white/50 whitespace-pre-wrap break-words leading-relaxed max-h-48 overflow-y-auto pt-3">
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
            className="rounded-xl font-mono text-xs bg-white text-black hover:bg-white/90"
            onPress={handleRetry}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Try again
          </Button>
          <Button
            variant="outline"
            className="rounded-xl font-mono text-xs bg-white/5 border-white/10 text-white/80 hover:bg-white/10"
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
