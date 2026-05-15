import { useRouter } from '@tanstack/react-router'
import { Button } from '@heroui/react'
import { Home, Copy } from 'lucide-react'
import toast from 'react-hot-toast'
import { cnm } from '@/utils/style'

export default function NotFoundPage() {
  const router = useRouter()

  const path = typeof window !== 'undefined' ? window.location.pathname : ''

  const handleCopy = async () => {
    const text = `404 Not Found: ${window.location.href}`
    await navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard', { id: 'not-found-copy' })
  }

  return (
    <div
      className={cnm(
        'min-h-screen w-full flex items-center justify-center',
        'bg-neutral-50 dark:bg-neutral-900',
        'px-6 py-20'
      )}
    >
      <div className="max-w-lg w-full text-center">
        <div className="mb-8 flex justify-center">
          <div
            className={cnm(
              'w-16 h-16 flex items-center justify-center',
              'border border-neutral-200 dark:border-neutral-800',
              'bg-neutral-100 dark:bg-neutral-800'
            )}
          >
            <span className="text-2xl font-mono font-light text-amber-500">
              ?
            </span>
          </div>
        </div>

        <p className="text-xs font-mono uppercase tracking-widest text-neutral-400 mb-3">
          404
        </p>

        <h1 className="text-2xl sm:text-3xl font-light text-neutral-900 dark:text-neutral-100 mb-4">
          Page not found
        </h1>

        <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>

        {path && (
          <div
            className={cnm(
              'mb-8 px-4 py-3 text-left',
              'border border-neutral-200 dark:border-neutral-800',
              'bg-neutral-100/50 dark:bg-neutral-800/30',
              'flex items-start justify-between gap-3'
            )}
          >
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1">
                Requested path
              </p>
              <p className="text-xs font-mono text-red-600 dark:text-red-400 break-all">
                {path}
              </p>
            </div>
            <Button
              isIconOnly
              size="sm"
              variant="outline"
              className="rounded-none shrink-0 mt-1 border-neutral-200 dark:border-neutral-700"
              onPress={handleCopy}
              aria-label="Copy error to clipboard"
            >
              <Copy className="w-3.5 h-3.5 text-neutral-400" />
            </Button>
          </div>
        )}

        <div className="flex items-center justify-center">
          <Button
            className={cnm(
              'rounded-none font-mono text-sm',
              'bg-neutral-900 dark:bg-neutral-100',
              'text-neutral-100 dark:text-neutral-900'
            )}
            onPress={() => router.navigate({ to: '/' })}
          >
            <Home className="w-4 h-4" />
            Go home
          </Button>
        </div>
      </div>
    </div>
  )
}
