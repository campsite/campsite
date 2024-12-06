import { useState } from 'react'

import { Button, Link, PlusIcon, UIText } from '@campsite/ui'

import { CreateOauthApplicationDialog } from '@/components/OrgSettings/OauthApplications/OauthApplicationFormDialog'
import { OauthAppsTable } from '@/components/OrgSettings/OauthApplications/OauthAppsTable'
import * as SettingsSection from '@/components/SettingsSection'

export function OrganizationOauthApplications() {
  const [createDialogIsOpen, setCreateDialogIsOpen] = useState(false)

  return (
    <SettingsSection.Section>
      <SettingsSection.Header className='p-3'>
        <SettingsSection.Title className='flex-1'>
          <div className='flex w-full items-center gap-3'>
            <div className='flex flex-col'>
              <span className='flex flex-1 items-center gap-1'>
                Custom integrations
                <span className='inline-block rounded bg-blue-100 px-1 py-px text-xs leading-4 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300'>
                  Beta
                </span>
              </span>
              <UIText tertiary>Connect your apps and services to your organization.</UIText>
            </div>
          </div>
        </SettingsSection.Title>
        <div className='flex items-center space-x-2'>
          <Button leftSlot={<PlusIcon />} onClick={() => setCreateDialogIsOpen(true)}>
            New
          </Button>
          <CreateOauthApplicationDialog open={createDialogIsOpen} onOpenChange={setCreateDialogIsOpen} />
        </div>
      </SettingsSection.Header>
      <SettingsSection.Separator className='-mb-px mt-0' />
      <OauthAppsTable />
      <SettingsSection.Footer>
        <p>
          <UIText>
            Building a custom integration?{' '}
            <Link href='https://developers.campsite.com' target='_blank' className='text-blue-500'>
              Visit our API docs &rsaquo;
            </Link>
          </UIText>
        </p>
      </SettingsSection.Footer>
    </SettingsSection.Section>
  )
}
