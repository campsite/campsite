import '!../build/global.css'

import { useEffect, useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createRoot } from 'react-dom/client'
import { useStore } from 'zustand'

import { ApiError, ApiErrorTypes } from '@campsite/types/generated'

import { App } from './components/App'
import { SignIn } from './components/SignIn'
import { CommandContext } from './core/command-context'
import { $figma } from './core/figma'
import { createTokenStore, TokenStoreContext } from './core/tokens'
import { LaunchCommand } from './types'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry(failureCount, error) {
        if (error instanceof ApiError && error.name === ApiErrorTypes.AuthenticationError) {
          return false
        }
        return failureCount < 3
      },
      onError: (error) => {
        if (error instanceof ApiError && error.name === ApiErrorTypes.AuthenticationError) {
          $figma.emit('signout')
        }
      }
    }
  }
})

export interface PluginProps extends Record<string, unknown> {
  command: LaunchCommand
  token?: string
}

function Plugin({ command, token: initialToken }: PluginProps) {
  const [store] = useState(() => createTokenStore(initialToken))
  const { token, onTokenChange } = useStore(store)

  // Update token on change.
  useEffect(() => {
    $figma.on('tokenchange', (token) => {
      onTokenChange(token)
      // Reset query client when token is removed.
      if (!token) {
        queryClient.clear()
      }
    })
  }, [onTokenChange])

  // Enable manual plugin refresh.
  useEffect(() => {
    function onRefresh(evt: KeyboardEvent) {
      if (evt.key === 'r' && (evt.metaKey || evt.ctrlKey)) {
        evt.preventDefault()
        $figma.emit('refresh')
      }
    }

    window.addEventListener('keydown', onRefresh)
    return () => {
      window.removeEventListener('keydown', onRefresh)
    }
  }, [])

  return (
    <>
      <style jsx global>{`
        :root {
          --font-inter: Inter;
        }
      `}</style>
      <TokenStoreContext.Provider value={store}>
        <QueryClientProvider client={queryClient}>
          <div className='bg-main flex min-h-full flex-1 flex-col'>
            {!token ? (
              <SignIn />
            ) : (
              <CommandContext.Provider value={command}>
                <App />
              </CommandContext.Provider>
            )}
          </div>
        </QueryClientProvider>
      </TokenStoreContext.Provider>
    </>
  )
}

function render(rootNode: HTMLElement, props: PluginProps) {
  const root = createRoot(rootNode)

  root.render(<Plugin {...props} />)
}

export default render
