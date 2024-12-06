import { useQueryClient } from '@tanstack/react-query'
import { useDeactivateOrganizationMember } from 'hooks/useDeactivateOrganizationMember'
import { useGetCurrentUser } from 'hooks/useGetCurrentUser'

import { PublicOrganization } from '@campsite/types'
import { Button } from '@campsite/ui'
import * as Dialog from '@campsite/ui/src/Dialog'

import { useScope } from '@/contexts/scope'
import { useGetOrganizationMember } from '@/hooks/useGetOrganizationMember'
import { useGetOrganizationMemberships } from '@/hooks/useGetOrganizationMemberships'
import { apiClient } from '@/utils/queryClient'

interface Props {
  organization: PublicOrganization
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LeaveOrganizationDialog(props: Props) {
  const { scope, setScope } = useScope()
  const { organization, open, onOpenChange } = props
  const queryClient = useQueryClient()
  const getCurrentUser = useGetCurrentUser()
  const getOrganizationMembership = useGetOrganizationMember({
    username: getCurrentUser.data?.username as string,
    org: organization.slug
  })
  const deactivateMemberMutation = useDeactivateOrganizationMember(organization.slug)
  const { data: memberships } = useGetOrganizationMemberships()

  async function handleOnRemove() {
    await deactivateMemberMutation.mutate(
      {
        id: getOrganizationMembership.data?.id as string
      },
      {
        onSuccess: () => {
          if (scope === organization.slug) {
            /*
              If you're leaving the last org you were viewing, it causes lots of issues 
              with scope and the page's back button. It's safer and easier to refresh the page
              so that the scope will be reset and the back button will take the user to their next
              available org (if one exists).
            */
            const nextMembership = memberships?.find((m) => m.organization.slug !== organization.slug)

            setScope(nextMembership?.organization.slug)

            return window.location.reload()
          }
          queryClient.invalidateQueries({
            queryKey: apiClient.organizationMemberships.getOrganizationMemberships().requestKey()
          })

          onOpenChange(false)
        }
      }
    )
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange} size='sm'>
      <Dialog.Header>
        <Dialog.Title>Leave {organization.name}?</Dialog.Title>
        <Dialog.Description>
          Are you sure you want to leave this organization? Your posts and activity will still be visible to other
          members.
        </Dialog.Description>
      </Dialog.Header>

      <Dialog.Footer>
        <Dialog.TrailingActions>
          <Button variant='flat' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant='destructive'
            onClick={handleOnRemove}
            disabled={deactivateMemberMutation.isPending}
            autoFocus
          >
            Leave
          </Button>
        </Dialog.TrailingActions>
      </Dialog.Footer>
    </Dialog.Root>
  )
}
