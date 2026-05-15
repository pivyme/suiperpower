import { useRouter } from '@tanstack/react-router'
import { Button } from '@heroui/react'
import { Copy, Home } from 'lucide-react'
import toast from 'react-hot-toast'

export default function NotFoundPage() {
  const router = useRouter()

  const path = typeof window !== 'undefined' ? window.location.pathname : ''

  const handleCopy = async () => {
    const text = `404 Not Found: ${window.location.href}`
    await navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard', { id: 'not-found-copy' })
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-black text-white px-6 py-20">
      <div className="max-w-lg w-full text-center">
        <div className="mb-8 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center border border-white/10 bg-white/5 backdrop-blur-md">
            <span className="text-2xl font-mono font-light text-white">?</span>
          </div>
        </div>

        <p className="text-xs font-mono uppercase tracking-widest text-white/40 mb-3">
          404
        </p>

        <h1 className="text-2xl sm:text-3xl font-light text-white mb-4">
          Page not found
        </h1>

        <p className="text-sm text-white/50 leading-relaxed mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>

        {path && (
          <div className="mb-8 flex items-start justify-between gap-3 border border-white/10 bg-white/5 px-4 py-3 text-left backdrop-blur-md">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-mono uppercase tracking-wider text-white/40 mb-1">
                Requested path
              </p>
              <p className="text-xs font-mono text-red-400/80 break-all">
                {path}
              </p>
            </div>
            <Button
              isIconOnly
              size="sm"
              variant="outline"
              className="mt-1 shrink-0 border-white/10 bg-white/5 text-white/60 [border-radius:0]"
              onPress={handleCopy}
              aria-label="Copy error to clipboard"
            >
              <Copy className="w-3.5 h-3.5" />
            </Button>
          </div>
        )}

        <div className="flex items-center justify-center">
          <Button
            className="bg-white font-mono text-sm text-black hover:bg-white/90 [border-radius:0]"
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
