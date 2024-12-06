import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSetAtom } from 'jotai'

import { UsersTimezonePostRequest } from '@campsite/types'

import { atomWithWebStorage } from '@/utils/atomWithWebStorage'
import { apiClient, setTypedQueriesData } from '@/utils/queryClient'

export const lastSwitchedTimezoneAtom = atomWithWebStorage<string | null>('lastSwitchedTimezone', null)

export function useCreateUserTimezone() {
  const queryClient = useQueryClient()
  const setLastSwitchedTimezone = useSetAtom(lastSwitchedTimezoneAtom)

  return useMutation({
    mutationFn: (data: UsersTimezonePostRequest) => apiClient.users.postMeTimezone().request(data),
    onMutate: (data) => {
      setLastSwitchedTimezone(data.timezone)
      setTypedQueriesData(queryClient, apiClient.users.getMe().requestKey(), (old) => {
        if (!old) return
        return { ...old, timezone: data.timezone }
      })
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: apiClient.users.getMe().requestKey() })
    }
  })
}
