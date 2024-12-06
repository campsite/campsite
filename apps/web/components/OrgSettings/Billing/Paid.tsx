import { SITE_URL } from '@campsite/config'
import { Button, Link, UIText } from '@campsite/ui'

import * as SettingsSection from '@/components/SettingsSection'
import { useCreateStripeBillingPortalSession } from '@/hooks/useCreateStripeBillingPortalSession'
import { useGetCurrentOrganization } from '@/hooks/useGetCurrentOrganization'

export function Paid() {
  const getCurrentOrganization = useGetCurrentOrganization()
  const currentOrganization = getCurrentOrganization.data
  const createStripeBillingPortalSession = useCreateStripeBillingPortalSession()

  const handleClick = () => {
    createStripeBillingPortalSession.mutate(undefined, {
      onSuccess: (data) => {
        window.location.replace(data.url)
      }
    })
  }

  return (
    <>
      <SettingsSection.Section>
        <div className='flex flex-col gap-4 p-4'>
          <div className='flex items-center justify-between gap-4'>
            <div className='flex flex-1 flex-col'>
              <UIText weight='font-semibold'>Manage subscription</UIText>
              <UIText secondary>Update your payment method or change plans</UIText>
            </div>
            <Button disabled={createStripeBillingPortalSession.isPending} onClick={handleClick}>
              Manage subscription
            </Button>
          </div>
          <div className='flex items-center justify-between gap-4'>
            <div className='flex flex-1 flex-col'>
              <UIText weight='font-semibold'>Billing email</UIText>
              <UIText secondary>{currentOrganization?.billing_email}</UIText>
            </div>
            <Button disabled={createStripeBillingPortalSession.isPending} onClick={handleClick}>
              Update
            </Button>
          </div>
        </div>
        <div className='flex justify-between border-t p-4'>
          <UIText weight='font-medium' tertiary>
            Questions or feedback?
          </UIText>
          <Button variant='text' href='mailto:support@campsite.com?subject=Campsite pricing'>
            Get in touch
          </Button>
        </div>
      </SettingsSection.Section>

      <SettingsSection.Section>
        <div className='flex items-center justify-between gap-4 p-4'>
          <div className='flex flex-1 flex-col'>
            {/* TODO: (GA Billing) Update "for Business" when terminology for enterprise plan finalized. */}
            <UIText weight='font-semibold'>Campsite for Business</UIText>
            <UIText secondary>
              Single sign-on, custom SLA, private support, and more.{' '}
              <Link target='_blank' rel='noopener noreferrer' href={`${SITE_URL}/pricing`} className='text-blue-500'>
                Learn more
              </Link>
            </UIText>
          </div>
          <Button href='https://cal.com/brianlovin/30min'>Schedule a call</Button>
        </div>
      </SettingsSection.Section>
    </>
  )
}
