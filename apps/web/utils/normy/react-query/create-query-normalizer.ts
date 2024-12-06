import type { QueryClient, QueryKey } from '@tanstack/react-query'

import { createNormalizer, Data, NormalizerConfig } from '@/utils/normy/core'

const shouldBeNormalized = (globalNormalize: boolean, localNormalize: boolean | undefined) => {
  if (localNormalize === undefined) {
    return globalNormalize
  }

  return localNormalize
}

export const createQueryNormalizer = (
  queryClient: QueryClient,
  normalizerConfig: Omit<NormalizerConfig, 'structuralSharing'> & {
    normalize?: boolean
  } = {}
) => {
  const normalize = normalizerConfig.normalize ?? true

  const normalizer = createNormalizer(normalizerConfig)

  let unsubscribeQueryCache: null | (() => void) = null
  let unsubscribeMutationCache: null | (() => void) = null

  let skipReentrantQueryUpdates = false
  const updateQueriesFromData = (data: Data, fromQueryKey?: string) => {
    if (skipReentrantQueryUpdates) {
      return
    }
    skipReentrantQueryUpdates = true

    const queriesToUpdate = normalizer.getQueriesToUpdate(data)

    queriesToUpdate.forEach((query) => {
      if (fromQueryKey !== query.queryKey) {
        queryClient.setQueryData(JSON.parse(query.queryKey) as QueryKey, () => query.data)
      }
    })
    skipReentrantQueryUpdates = false
  }

  return {
    getNormalizedData: normalizer.getNormalizedData,
    setNormalizedData: (data: Data) => updateQueriesFromData(data),
    clear: normalizer.clearNormalizedData,
    subscribe: () => {
      unsubscribeQueryCache = queryClient.getQueryCache().subscribe((event) => {
        if (event.type === 'removed') {
          normalizer.removeQuery(JSON.stringify(event.query.queryKey))
        } else if (
          event.type === 'updated' &&
          event.action.type === 'success' &&
          event.action.data !== undefined &&
          shouldBeNormalized(normalize, event.query.meta?.normalize as boolean | undefined)
        ) {
          const queryKey = JSON.stringify(event.query.queryKey)

          updateQueriesFromData(event.action.data as Data, queryKey)
          normalizer.setQuery(queryKey, event.action.data as Data)
        }
      })

      unsubscribeMutationCache = queryClient.getMutationCache().subscribe((event) => {
        if (
          event.type === 'updated' &&
          event.action.type === 'success' &&
          event.action.data &&
          shouldBeNormalized(normalize, event.mutation.meta?.normalize as boolean | undefined)
        ) {
          updateQueriesFromData(event.action.data as Data)
        } else if (
          event.type === 'updated' &&
          event.action.type === 'pending' &&
          (event.mutation.state?.context as { optimisticData?: Data })?.optimisticData
        ) {
          updateQueriesFromData((event.mutation.state.context as { optimisticData: Data }).optimisticData)
        } else if (
          event.type === 'updated' &&
          event.action.type === 'error' &&
          (event.mutation.state?.context as { rollbackData?: Data })?.rollbackData
        ) {
          updateQueriesFromData((event.mutation.state.context as { rollbackData: Data }).rollbackData)
        }
      })
    },
    unsubscribe: () => {
      unsubscribeQueryCache?.()
      unsubscribeMutationCache?.()
      unsubscribeQueryCache = null
      unsubscribeMutationCache = null
    },
    getObjectById: normalizer.getObjectById,
    getQueryFragment: normalizer.getQueryFragment
  }
}
