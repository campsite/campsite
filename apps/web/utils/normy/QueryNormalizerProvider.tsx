import * as React from 'react'
import { QueryClient } from '@tanstack/react-query'

import { NormalizerConfig } from '@/utils/normy/core'
import { createQueryNormalizer } from '@/utils/normy/react-query/create-query-normalizer'

const QueryNormalizerContext = React.createContext<undefined | ReturnType<typeof createQueryNormalizer>>(undefined)

export const QueryNormalizerProvider = ({
  queryClient,
  normalizerConfig,
  children
}: {
  queryClient: QueryClient
  children: React.ReactNode
  normalizerConfig?: Omit<NormalizerConfig, 'structuralSharing'> & {
    normalize?: boolean
  }
}) => {
  const [queryNormalizer] = React.useState(() => createQueryNormalizer(queryClient, normalizerConfig))

  React.useEffect(() => {
    queryNormalizer.subscribe()

    return () => {
      queryNormalizer.unsubscribe()
      queryNormalizer.clear()
    }
  }, [queryNormalizer])

  return <QueryNormalizerContext.Provider value={queryNormalizer}>{children}</QueryNormalizerContext.Provider>
}

export const useQueryNormalizer = () => {
  const queryNormalizer = React.useContext(QueryNormalizerContext)

  if (!queryNormalizer) {
    throw new Error('No QueryNormalizer set, use QueryNormalizerProvider to set one')
  }

  return queryNormalizer
}
