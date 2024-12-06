import { useQuery } from '@tanstack/react-query'

import { useScope } from '@/contexts/scope'
import { apiClient } from '@/utils/queryClient'

const query = apiClient.organizations.getMembersByUsername()

export function useGetOrganizationMember({
  username,
  org,
  enabled = true
}: {
  username?: string
  org?: string
  enabled?: boolean
}) {
  /*
    There are many places this can be used:
    - in the user's account settings page
    - in the organization people settings page

    When an org slug is present, we can get it automatically
    from the URL. Otherwise, if the user is trying to leave a organization
    from their account settings, an optional org slug can be passed in as
    a parameter.
  */
  const { scope } = useScope()
  const orgSlug = org || scope

  return useQuery({
    queryKey: query.requestKey(`${orgSlug}`, `${username}`),
    queryFn: () => query.request(`${orgSlug}`, `${username}`),
    enabled: !!username && enabled
  })
}
