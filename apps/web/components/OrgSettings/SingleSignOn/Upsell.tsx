import { Button, UIText } from '@campsite/ui'

import * as SettingsSection from '@/components/SettingsSection'

export function SingleSignOnUpsell() {
  return (
    <>
      <SettingsSection.Section>
        <SettingsSection.Header>
          <SettingsSection.Title>
            <div className='flex items-center gap-3 pb-1'>
              <span>Single Sign-On</span>
            </div>
          </SettingsSection.Title>
        </SettingsSection.Header>

        <SettingsSection.Description>
          Enable SSO authentication with your organization’s Identity Provider (IdP)
        </SettingsSection.Description>

        <SettingsSection.Separator />

        <div className='flex flex-col px-3 pb-3'>
          <div className='flex items-start space-x-16 space-y-0 sm:items-center sm:space-y-0'>
            <div className='flex flex-1 flex-col'>
              {/* TODO: (GA Billing) Update "business plan" when terminology for enterprise plan finalized. */}
              <UIText>
                To enable SSO for your organization, a business plan is required. Get in touch with our team to learn
                more.
              </UIText>
            </div>
            <Button href='mailto:support@campsite.com'>Get in touch</Button>
          </div>
        </div>
      </SettingsSection.Section>
    </>
  )
}
