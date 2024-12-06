import { useState } from 'react'

import { SITE_URL, WEB_URL } from '@campsite/config/index'
import { PublicOrganization } from '@campsite/types/generated'
import { Avatar } from '@campsite/ui/Avatar'
import { Badge } from '@campsite/ui/Badge'
import { Button } from '@campsite/ui/Button'
import * as Dialog from '@campsite/ui/src/Dialog'
import { UIText } from '@campsite/ui/Text'

import { BreadcrumbTitlebar } from '@/components/Titlebar/BreadcrumbTitlebar'
import { useScope } from '@/contexts/scope'
import { useGetCurrentOrganization } from '@/hooks/useGetCurrentOrganization'
import { useGetCurrentUser } from '@/hooks/useGetCurrentUser'
import { useSearchOrganizationMembers } from '@/hooks/useSearchOrganizationMembers'
import { useViewerIsAdmin } from '@/hooks/useViewerIsAdmin'
import { flattenInfiniteData } from '@/utils/flattenInfiniteData'

export function TrialExpiredBanner() {
  const { scope } = useScope()
  const { data: currentOrganization } = useGetCurrentOrganization()
  const viewerIsAdmin = useViewerIsAdmin()
  const [askDialogOpen, setAskDialogOpen] = useState(false)

  if (!currentOrganization?.trial_expired) return null

  return (
    <BreadcrumbTitlebar
      hideSidebarToggle
      className='bg-gradient-to-t from-gray-50 to-white dark:from-gray-900 dark:to-gray-950'
    >
      <Badge color='brand' className='px-2 py-1.5 text-xs'>
        Trial expired
      </Badge>
      <UIText weight='font-semibold'>Unlimited posts, docs, calls, and chat — upgrade</UIText>

      <div className='ml-auto flex items-center gap-1.5'>
        <Button variant='flat' href={`${SITE_URL}/contact`} externalLink>
          Contact us
        </Button>
        {viewerIsAdmin && (
          <Button href={`/${scope}/settings/billing`} variant='brand'>
            Upgrade
          </Button>
        )}
        {!viewerIsAdmin && (
          <>
            <AskAdminDialog open={askDialogOpen} onOpenChange={setAskDialogOpen} organization={currentOrganization} />
            <Button onClick={() => setAskDialogOpen(true)} variant='brand'>
              Request upgrade
            </Button>
          </>
        )}
      </div>
    </BreadcrumbTitlebar>
  )
}

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  organization: PublicOrganization
}

function AskAdminDialog({ open, onOpenChange, organization }: DialogProps) {
  const searchOrganizationMembers = useSearchOrganizationMembers({
    roles: ['admin'],
    enabled: open,
    scope: organization.slug
  })
  const admins = flattenInfiniteData(searchOrganizationMembers.data)
  const { data: currentUser } = useGetCurrentUser()

  return (
    <Dialog.Root
      open={open}
      onOpenChange={onOpenChange}
      size='xl'
      visuallyHiddenTitle='Ask an admin to upgrade'
      visuallyHiddenDescription='An admin needs to upgrade your organization to continue with unlimited posts, docs, calls, and chat.'
    >
      <Dialog.Content>
        <div className='flex flex-col justify-center gap-4 px-1 pb-2 pt-6'>
          <div className='flex flex-col gap-2'>
            <UIText weight='font-semibold' size='text-base'>
              Ask an admin to upgrade
            </UIText>
            <UIText secondary>
              An admin needs to upgrade your organization to continue with unlimited posts, docs, calls, and chat.
            </UIText>
          </div>

          {admins && (
            <div className='bg-tertiary flex flex-col gap-3 rounded-lg p-4'>
              {admins.map((member) => (
                <div className='flex-1 text-sm' key={member.id}>
                  <div className='flex items-center gap-3'>
                    <Avatar name={member.user.display_name} size='base' urls={member.user.avatar_urls} />
                    <div className='flex-1'>
                      <UIText weight='font-medium'>{member.user.display_name}</UIText>
                      <UIText tertiary selectable>
                        {member.user.email}
                      </UIText>
                    </div>
                    <Button
                      href={`mailto:${member.user.email}?subject=Campsite upgrade request from ${currentUser?.display_name} (${currentUser?.email})&body=Hey ${member.user.display_name},%0D%0A%0D%0ACan I get your help to upgrade Campsite so we can keep using it?%0D%0A%0D%0AWe can upgrade from the organization settings page: ${WEB_URL}/${organization?.slug}/settings%0D%0A%0D%0APricing details here: ${SITE_URL}/pricing%0D%0A%0D%0AThanks!%0D%0A`}
                      variant='primary'
                    >
                      Send email
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Dialog.Content>
      <Dialog.Footer>
        <Dialog.TrailingActions>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </Dialog.TrailingActions>
      </Dialog.Footer>
    </Dialog.Root>
  )
}
