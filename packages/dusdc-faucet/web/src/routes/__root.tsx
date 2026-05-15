import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import { Toaster } from 'react-hot-toast'
import LenisSmoothScrollProvider from '../providers/LenisSmoothScrollProvider'
import { ThemeProvider } from '../providers/ThemeProvider'
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
      { title: 'DUSDC Faucet · DeepBook Predict Testnet' },
      {
        name: 'description',
        content:
          'Trade testnet SUI for DUSDC at 100 to 1. Swap back any time. No form, no waiting.',
      },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (theme) {
                    theme = JSON.parse(theme);
                  }
                  document.documentElement.classList.add(theme || 'dark');
                } catch (e) {
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body className="bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-50 antialiased transition-colors duration-300">
        <ThemeProvider>
          <SuiProviders>
            <LenisSmoothScrollProvider />
            <Toaster
              position="bottom-center"
              toastOptions={{
                style: {
                  background: 'var(--toast-bg)',
                  color: 'var(--toast-color)',
                  border: '1px solid var(--toast-border)',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontFamily: 'Google Sans Code, monospace',
                },
                success: {
                  iconTheme: { primary: '#fbbf24', secondary: '#0a0a0a' },
                },
              }}
            />
            {children}
          </SuiProviders>
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  )
}
