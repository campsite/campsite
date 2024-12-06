import { createContext, useContext } from 'react'
import { createStore, StoreApi, useStore } from 'zustand'

export interface TokenStore {
  token?: string
  onTokenChange(token: string | undefined): void
}

export const createTokenStore = (defaultToken?: string) =>
  createStore<TokenStore>((set) => ({
    token: defaultToken,
    onTokenChange: (token: string) => set({ token })
  }))

export const TokenStoreContext = createContext<StoreApi<TokenStore>>(null as any)

/**
 * Gets the latest stored API access token.
 */
export function useToken(): string | undefined {
  const store = useContext(TokenStoreContext)

  if (!store) {
    throw new Error('useTokenStore must be used within a TokenContext.Provider')
  }

  return useStore(store, (state) => state.token)
}
