import { useQuery } from '@tanstack/react-query'

import { useScope } from '@/contexts/scope'
import { apiClient } from '@/utils/queryClient'

const query = apiClient.organizations.getCallRoomsById()

type Props = {
  callRoomId: string
}

export function useGetCallRoom({ callRoomId }: Props) {
  const { scope } = useScope()

  return useQuery({
    queryKey: query.requestKey(`${scope}`, callRoomId),
    queryFn: () => query.request(`${scope}`, callRoomId),
    enabled: !!scope,
    staleTime: 30 * 1000
  })
}
