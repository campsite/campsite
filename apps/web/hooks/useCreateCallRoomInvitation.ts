import { useMutation } from '@tanstack/react-query'

import { OrganizationCallRoomInvitationsPostRequest } from '@campsite/types/generated'

import { useScope } from '@/contexts/scope'
import { apiClient } from '@/utils/queryClient'

const query = apiClient.organizations.postCallRoomsInvitations()

export function useCreateCallRoomInvitation({ callRoomId }: { callRoomId: string }) {
  const { scope } = useScope()

  return useMutation({
    mutationFn: (data: OrganizationCallRoomInvitationsPostRequest) => query.request(`${scope}`, callRoomId, data)
  })
}
