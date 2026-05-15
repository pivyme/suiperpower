import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import LenisSmoothScrollProvider from '../providers/LenisSmoothScrollProvider'
import { ThemeProvider } from '../providers/ThemeProvider'
import { Toaster } from 'react-hot-toast'
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
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Kwek Labs Web Starter',
      },
      {
        name: 'description',
        content: 'A modern web starter template by Kwek Labs',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
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
      <body className="bg-neutral-50 text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100 antialiased transition-colors duration-300">
        <ThemeProvider>
          <LenisSmoothScrollProvider />
          <Toaster
            position="bottom-center"
            toastOptions={{
              style: {
                background: 'var(--toast-bg)',
                color: 'var(--toast-color)',
                border: '1px solid var(--toast-border)',
                borderRadius: '0px',
                fontSize: '13px',
                fontFamily: 'monospace',
              },
              success: {
                iconTheme: {
                  primary: '#f59e0b',
                  secondary: '#fff',
                },
              },
            }}
          />
          {children}
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  )
}
