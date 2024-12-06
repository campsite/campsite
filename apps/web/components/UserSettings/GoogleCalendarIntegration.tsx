import * as SettingsSection from 'components/SettingsSection'
import Image from 'next/image'

import { GOOGLE_CALENDAR_ADD_ON_URL } from '@campsite/config'
import { Button, CalendarIcon, GearIcon, Select, SelectOption, UIText } from '@campsite/ui'

import { useGetGoogleCalendarIntegration } from '@/hooks/useGetGoogleCalendarIntegration'
import { useGetOrganizationMemberships } from '@/hooks/useGetOrganizationMemberships'
import { useUpdateGoogleCalendarOrganization } from '@/hooks/useUpdateGoogleCalendarOrganization'

export function GoogleCalendarIntegration() {
  const { data: memberships } = useGetOrganizationMemberships()
  const organizations = memberships?.map((m) => m.organization) || []
  const organizationOptions: SelectOption[] = organizations.map((o) => ({ label: o.name, value: o.id })) || []
  const { data: googleCalendarIntegration } = useGetGoogleCalendarIntegration()
  const { mutate: updateGoogleCalendarOrganization } = useUpdateGoogleCalendarOrganization()

  return (
    <SettingsSection.Section id='google-calendar'>
      <SettingsSection.Header>
        <SettingsSection.Title>
          <div className='flex items-center gap-3'>
            <Image
              src='/img/services/google-calendar.png'
              width='36'
              height='36'
              alt='Google Calendar icon'
              className='rounded-md'
            />
            <span>Google Calendar</span>
          </div>
        </SettingsSection.Title>
      </SettingsSection.Header>

      <SettingsSection.Separator />

      <div className='flex flex-col'>
        <div className='flex items-start gap-3 p-3 pt-0 md:items-center'>
          <div className='bg-quaternary text-primary flex h-8 w-8 items-center justify-center rounded-full font-mono text-base font-bold'>
            <CalendarIcon />
          </div>

          <div className='flex flex-1 flex-col items-start gap-2 md:flex-row md:items-center md:justify-between'>
            <div className='flex flex-1 flex-col'>
              <UIText weight='font-medium'>Add Campsite to Google Calendar</UIText>
              <UIText secondary>Attach call links to calendar events in a single click</UIText>
            </div>

            {googleCalendarIntegration?.installed ? (
              <Button href={GOOGLE_CALENDAR_ADD_ON_URL} variant='base' externalLink>
                Manage the add-on
              </Button>
            ) : (
              <Button href={GOOGLE_CALENDAR_ADD_ON_URL} variant='primary' externalLink>
                Install the add-on
              </Button>
            )}
          </div>
        </div>

        {organizationOptions.length > 1 && (
          <div className='flex items-start gap-3 border-t p-3 md:items-center'>
            <div className='bg-quaternary text-primary flex h-8 w-8 items-center justify-center rounded-full font-mono text-base font-bold'>
              <GearIcon />
            </div>

            <div className='flex flex-1 flex-col items-start gap-2 md:flex-row md:items-center md:justify-between'>
              <div className='flex flex-1 flex-col'>
                <UIText weight='font-medium'>Default organization</UIText>
                <UIText secondary>Call recordings and summaries will be saved to this organization</UIText>
              </div>

              <Select
                options={organizationOptions}
                value={googleCalendarIntegration?.organization?.id || ''}
                onChange={(organizationId) => {
                  const org = organizations.find((o) => o.id === organizationId)

                  if (org) updateGoogleCalendarOrganization(org)
                }}
              />
            </div>
          </div>
        )}
      </div>
    </SettingsSection.Section>
  )
}
