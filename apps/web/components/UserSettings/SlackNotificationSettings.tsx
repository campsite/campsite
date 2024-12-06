import { useState } from 'react'
import * as SettingsSection from 'components/SettingsSection'

import { WEB_URL } from '@campsite/config'
import { PublicOrganization } from '@campsite/types'
import { Avatar, Button, LazyLoadingSpinner, SlackIcon, UIText } from '@campsite/ui'
import * as Dialog from '@campsite/ui/src/Dialog'

import { ConnectSlackButton } from '@/components/OrgSettings/ConnectSlackButton'
import { useCreateSlackNotificationPreference } from '@/hooks/useCreateSlackNotificationPreference'
import { useDeleteSlackNotificationPreference } from '@/hooks/useDeleteSlackNotificationPreference'
import { useGetCurrentUser } from '@/hooks/useGetCurrentUser'
import { useGetOrganizationMemberships } from '@/hooks/useGetOrganizationMemberships'
import { useGetSlackIntegration } from '@/hooks/useGetSlackIntegration'
import { useGetSlackNotificationPreference } from '@/hooks/useGetSlackNotificationPreference'
import { useSearchOrganizationMembers } from '@/hooks/useSearchOrganizationMembers'
import { useSlackBroadcastsAuthorizationUrl } from '@/hooks/useSlackBroadcastsAuthorizationUrl'
import { useSlackNotificationsAuthorizationUrl } from '@/hooks/useSlackNotificationsAuthorizationUrl'
import { flattenInfiniteData } from '@/utils/flattenInfiniteData'

export function SlackNotificationSettings() {
  const { data: memberships, isLoading } = useGetOrganizationMemberships()

  return (
    <SettingsSection.Section>
      <SettingsSection.Header>
        <SettingsSection.Title>Slack notifications</SettingsSection.Title>
      </SettingsSection.Header>

      <SettingsSection.Description>
        Get personal notifications for mentions, activity on your posts, and new posts in subcribed channels.
      </SettingsSection.Description>

      <SettingsSection.Separator />

      {!memberships && isLoading && (
        <div className='flex items-center justify-center p-8'>
          <LazyLoadingSpinner />
        </div>
      )}

      {!memberships?.length && (
        <div className='flex flex-col items-center justify-center p-8 pt-5 text-center'>
          <UIText tertiary>You are not a member of any organizations yet</UIText>
        </div>
      )}

      {memberships && !isLoading && (
        <div className='-mt-3 divide-y'>
          {memberships.map(({ organization }) => (
            <div key={organization.id} className='flex flex-col p-3'>
              <div className='flex items-center gap-3'>
                <Avatar urls={organization.avatar_urls} rounded='rounded-md' name={organization.name} />
                <div className='flex flex-1 items-center justify-between gap-4'>
                  <UIText weight='font-medium flex-1 line-clamp-1'>{organization.name}</UIText>
                  <SlackNotificationButton organization={organization} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </SettingsSection.Section>
  )
}

interface Props {
  organization: PublicOrganization
}

function SlackNotificationButton(props: Props) {
  const { organization } = props
  const [isAdminDialogOpen, setIsAdminDialogOpen] = useState(false)

  const { data: integration, isLoading: slackIntegrationIsLoading } = useGetSlackIntegration({
    orgSlug: organization.slug
  })

  const { data: slackNotificationsEnabled, isLoading: slackNotificationPreferenceIsLoading } =
    useGetSlackNotificationPreference(organization.slug)
  const createSlackNotificationPreference = useCreateSlackNotificationPreference(organization.slug)
  const deleteSlackNotificationPreference = useDeleteSlackNotificationPreference(organization.slug)
  const slackBroadcastsAuthorizationUrl = useSlackBroadcastsAuthorizationUrl({
    organization,
    enableNotifications: true
  })
  const slackNotificationsAuthorizationUrl = useSlackNotificationsAuthorizationUrl({
    organization,
    teamId: integration?.team_id
  })

  if (slackIntegrationIsLoading || slackNotificationPreferenceIsLoading) return <LazyLoadingSpinner />

  if (!integration) {
    if (organization.viewer_is_admin) {
      return <ConnectSlackButton href={slackBroadcastsAuthorizationUrl} />
    } else {
      return (
        <>
          <AskAdminDialog organization={organization} open={isAdminDialogOpen} onOpenChange={setIsAdminDialogOpen} />
          <Button onClick={() => setIsAdminDialogOpen(true)} variant='primary'>
            Ask an admin
          </Button>
        </>
      )
    }
  }

  return (
    <div>
      {integration?.current_organization_membership_is_linked ? (
        slackNotificationsEnabled?.enabled ? (
          <Button variant='flat' onClick={() => deleteSlackNotificationPreference.mutate()}>
            Disable
          </Button>
        ) : (
          <Button onClick={() => createSlackNotificationPreference.mutate()}>Enable</Button>
        )
      ) : (
        <ConnectSlackButton href={slackNotificationsAuthorizationUrl} />
      )}
    </div>
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
      visuallyHiddenTitle='Ask an admin to connect to Slack'
      visuallyHiddenDescription='An admin needs to connect this organization to Slack before you can enable personal notifications.'
    >
      <Dialog.Content>
        <div className='flex flex-col justify-center gap-4 px-1 pb-2 pt-6'>
          <SlackIcon />
          <div className='flex flex-col gap-2'>
            <UIText weight='font-semibold' size='text-base'>
              Ask an admin to connect to Slack
            </UIText>
            <UIText secondary>
              An admin needs to connect this organization to Slack before you can enable personal notifications.
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
                      href={`mailto:${member.user.email}?subject=Campsite Slack connection request from ${currentUser?.display_name} (${currentUser?.email})&body=Hey ${member.user.display_name},%0D%0A%0D%0AI'd like to enable personal Slack notifications on Campsite so it's easier for me to keep up with new activity.%0D%0A%0D%0ATo turn this feature on, we need to connect our organization to Slack. Here's a link to our org settings where you can connect Campsite to Slack: ${WEB_URL}/${organization?.slug}/settings%0D%0A%0D%0AThanks!%0D%0A`}
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
