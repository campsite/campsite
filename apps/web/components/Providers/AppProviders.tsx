import { useState } from 'react'
import { HydrationBoundary, QueryClientProvider } from '@tanstack/react-query'

import { ScopeProvider } from '@/contexts/scope'
import { queryClient } from '@/utils/queryClient'
import { PageWithProviders } from '@/utils/types'

const AppProviders: PageWithProviders<any> = ({ children, dehydratedState }) => {
  const [client] = useState(() => queryClient())

  return (
    <QueryClientProvider client={client}>
      <HydrationBoundary state={dehydratedState}>
        <ScopeProvider>{children}</ScopeProvider>
      </HydrationBoundary>
    </QueryClientProvider>
  )
}

export default AppProviders
