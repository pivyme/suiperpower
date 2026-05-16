import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import { Toaster } from 'react-hot-toast'
import LenisSmoothScrollProvider from '../providers/LenisSmoothScrollProvider'
import { SuiProviders } from '../providers/SuiProviders'
import ErrorPage from '../components/ErrorPage'
import NotFoundPage from '../components/NotFoundPage'

import appCss from '../styles.css?url'

import type { QueryClient } from '@tanstack/react-query'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  notFoundComponent: () => <NotFoundPage />,
  errorComponent: ({ error, reset }) => <ErrorPage error={error} reset={reset} />,
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { name: 'color-scheme', content: 'dark' },
      { title: 'DUSDC Faucet · DeepBook Predict Testnet' },
      {
        name: 'description',
        content:
          'Trade testnet SUI for DUSDC at 100 to 1. Swap back any time. No form, no waiting.',
      },
      { property: 'og:type', content: 'website' },
      { property: 'og:title', content: 'DUSDC FAUCET' },
      { property: 'og:url', content: 'https://dusdc-faucet.klvn.dev' },
      { property: 'og:image', content: 'https://dusdc-faucet.klvn.dev/dusdc-faucet-og.jpg' },
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: 'DUSDC FAUCET' },
      { name: 'twitter:image', content: 'https://dusdc-faucet.klvn.dev/dusdc-faucet-og.jpg' },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', type: 'image/jpeg', href: '/dusdc-faucet-favicon.jpg' },
      { rel: 'apple-touch-icon', href: '/dusdc-faucet-favicon.jpg' },
      { rel: 'canonical', href: 'https://dusdc-faucet.klvn.dev' },
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
      {
        rel: 'stylesheet',
        href:
          'https://fonts.googleapis.com/css2?family=Google+Sans+Code:ital,wght@0,300..700;1,300..700&family=Google+Sans+Flex:opsz,wght@6..144,300..700&display=swap',
      },
    ],
  }),

  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="bg-black text-white antialiased">
        <SuiProviders>
          <LenisSmoothScrollProvider />
          <Toaster
            position="bottom-center"
            toastOptions={{
              style: {
                background: 'rgba(20, 20, 20, 0.85)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '0px',
                fontSize: '13px',
                fontFamily: 'Google Sans Code, monospace',
                backdropFilter: 'blur(12px)',
              },
              success: {
                iconTheme: { primary: '#ffffff', secondary: '#000000' },
              },
            }}
          />
          {children}
        </SuiProviders>
        <Scripts />
      </body>
    </html>
  )
}
