import * as SettingsSection from 'components/SettingsSection'
import toast from 'react-hot-toast'

import { PublicOrganization } from '@campsite/types'
import { Avatar, Button, LazyLoadingSpinner, Link, UIText, useCopyToClipboard } from '@campsite/ui'

import { useGetOrganizationMemberships } from '@/hooks/useGetOrganizationMemberships'
import { useGetPersonalCallRoom } from '@/hooks/useGetPersonalCallRoom'

export function PersonalCallLinks() {
  const { data: memberships, isLoading } = useGetOrganizationMemberships()

  return (
    <SettingsSection.Section>
      <SettingsSection.Header>
        <SettingsSection.Title>Personal call links</SettingsSection.Title>
      </SettingsSection.Header>

      <SettingsSection.Description>
        Share these links with anyone or add them to scheduling tools,{' '}
        <Link
          className='text-blue-500 hover:underline'
          href='https://www.campsite.com/changelog/2024-07-18-personal-meeting-links'
          target='_blank'
        >
          like Notion Calendar and Calendly
        </Link>
        . Whoever clicks them will join your call, no Campsite account required.
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
                  <UIText weight='font-medium line-clamp-1'>{organization.name}</UIText>
                  <PersonalCallLinkButton organization={organization} />
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

function PersonalCallLinkButton({ organization }: Props) {
  const { data: personalCallRoom, isLoading } = useGetPersonalCallRoom({ orgSlug: organization.slug })
  const [copy] = useCopyToClipboard()

  function onClick() {
    if (!personalCallRoom) return
    copy(personalCallRoom.url)
    toast('Personal call link copied to clipboard.')
  }

  if (isLoading) return <LazyLoadingSpinner />

  return (
    <Button onClick={onClick} variant='flat'>
      Copy link
    </Button>
  )
}
