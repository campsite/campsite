import { useMutation } from '@tanstack/react-query'

import { OrganizationCallRoomsPostRequest } from '@campsite/types/generated'

import { useScope } from '@/contexts/scope'
import { apiClient } from '@/utils/queryClient'

const query = apiClient.organizations.postCallRooms()

export function useCreateCallRoom() {
  const { scope } = useScope()

  return useMutation({
    mutationFn: (data: OrganizationCallRoomsPostRequest) => query.request(`${scope}`, data)
  })
}
