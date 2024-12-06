import pluralize from 'pluralize'

import { Button } from '@campsite/ui/Button'
import { UIText } from '@campsite/ui/Text'

import { InvitePeopleButton } from '@/components/People/InvitePeopleButton'
import { useScope } from '@/contexts/scope'
import { useGetCurrentOrganization } from '@/hooks/useGetCurrentOrganization'
import { useGetCurrentUser } from '@/hooks/useGetCurrentUser'
import { useViewerIsAdmin } from '@/hooks/useViewerIsAdmin'

export function TrialActiveBanner() {
  const { scope } = useScope()
  const viewerIsAdmin = useViewerIsAdmin()
  const { data: organization } = useGetCurrentOrganization()
  const isTrialActive = organization?.trial_active
  const { data: currentUser } = useGetCurrentUser()

  if (!isTrialActive) return null
  if (!viewerIsAdmin) return null
  if (!organization) return null
  if (!organization.trial_days_remaining) return null
  if (!currentUser) return null

  const areIs = organization?.trial_days_remaining === 1 ? 'is' : 'are'
  const days = pluralize('day', organization.trial_days_remaining)

  return (
    <div className='bg-tertiary text-secondary dark:bg-elevated mb-2 flex flex-col gap-2 rounded-lg border p-3'>
      <UIText size='text-xs' secondary className='text-balance'>
        There {areIs}{' '}
        <span className='text-primary search-highlight font-medium'>
          {organization?.trial_days_remaining} {days}
        </span>{' '}
        left in your trial. Get in touch with questions or feedback.
      </UIText>
      <Button size='sm' variant='base' href={`/${scope}/settings/billing`}>
        Upgrade
      </Button>
      <InvitePeopleButton size='sm' variant='flat' label='Invite your team' leftSlot={null} />
      <Button
        href='https://cal.com/brianlovin/campsite-demo'
        externalLink
        size='sm'
        variant='flat'
        className='dark:bg-transparent'
      >
        Book a demo
      </Button>
    </div>
  )
}
