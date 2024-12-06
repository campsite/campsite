import * as SettingsSection from 'components/SettingsSection'
import Image from 'next/image'

import { CAL_DOT_COM_APP_URL } from '@campsite/config'
import { Button, CalendarIcon, GearIcon, Select, SelectOption, UIText } from '@campsite/ui'

import { useGetCalDotComIntegration } from '@/hooks/useGetCalDotComIntegration'
import { useGetOrganizationMemberships } from '@/hooks/useGetOrganizationMemberships'
import { useUpdateCalDotComOrganization } from '@/hooks/useUpdateCalDotComOrganization'

export function CalDotComIntegration() {
  const { data: memberships } = useGetOrganizationMemberships()
  const organizations = memberships?.map((m) => m.organization) || []
  const organizationOptions: SelectOption[] = organizations.map((o) => ({ label: o.name, value: o.id })) || []
  const { data: calDotComIntegration } = useGetCalDotComIntegration()
  const { mutate: updateCalDotComOrganization } = useUpdateCalDotComOrganization()

  return (
    <SettingsSection.Section>
      <SettingsSection.Header>
        <SettingsSection.Title>
          <div className='flex items-center gap-3'>
            <Image
              src='/img/services/cal-dot-com.png'
              width='36'
              height='36'
              alt='Cal.com icon'
              className='rounded-md dark:ring-1 dark:ring-white/10'
            />
            <span>Cal.com</span>
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
              <UIText weight='font-medium'>Add Campsite to Cal.com</UIText>
              <UIText secondary>Use Campsite calls for new bookings</UIText>
            </div>

            {calDotComIntegration?.installed ? (
              <Button href={CAL_DOT_COM_APP_URL} variant='base' externalLink>
                Manage the app
              </Button>
            ) : (
              <Button href={CAL_DOT_COM_APP_URL} variant='primary' externalLink>
                Install the app
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
                value={calDotComIntegration?.organization?.id || ''}
                onChange={(organizationId) => {
                  const org = organizations.find((o) => o.id === organizationId)

                  if (org) updateCalDotComOrganization(org)
                }}
              />
            </div>
          </div>
        )}
      </div>
    </SettingsSection.Section>
  )
}
