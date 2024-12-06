import { MutationOptions, QueryFilters, QueryKey, useMutation, useQueryClient } from '@tanstack/react-query'

type OptimisticFn<T = any> = {
  query: QueryKey | QueryFilters
  updater: (old: T) => T
}

function isQueryKey(value: QueryKey | QueryFilters): value is QueryKey {
  return Array.isArray(value)
}

export function useOptimisticMutation<TData, TError, TVariables>(
  options: MutationOptions<TData, TError, TVariables> & {
    optimisticFns: (variables: TVariables) => OptimisticFn[]
    invalidateOnSuccess?: boolean
  }
) {
  const queryClient = useQueryClient()

  return useMutation({
    ...options,

    onMutate(variables) {
      const optimisticFns = options.optimisticFns(variables)
      const results = optimisticFns.map((value) => {
        const { query: queryKey, updater } = value

        // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
        if (isQueryKey(queryKey)) {
          queryClient.cancelQueries({ queryKey })
        } else {
          queryClient.cancelQueries(queryKey)
        }

        let old: [QueryKey, unknown][]

        if (isQueryKey(queryKey)) {
          old = queryClient.getQueriesData({ queryKey })
        } else {
          old = queryClient.getQueriesData(queryKey)
        }

        const rollback = () => {
          old.forEach(([key, value]) => {
            queryClient.setQueryData(key, value)
          })
        }
        const invalidate = () => {
          if (isQueryKey(queryKey)) {
            queryClient.invalidateQueries({ queryKey })
          } else {
            queryClient.invalidateQueries(queryKey)
          }
        }

        // Update data in query cache
        old.forEach(([key, value]) => {
          queryClient.setQueryData(key, value ? updater(value) : value)
        })

        return { rollback, invalidate }
      })

      options.onMutate?.(variables)

      return { results }
    },

    onError(error, variables, context) {
      if (!context) return
      context.results.forEach(({ rollback }) => rollback())
      options.onError?.(error, variables, context)
    },

    onSuccess(data, variables, context) {
      if (!context) return
      if (options.invalidateOnSuccess) {
        context.results.forEach(({ invalidate }) => invalidate())
      }
      options.onSuccess?.(data, variables, context)
    }
  })
}
