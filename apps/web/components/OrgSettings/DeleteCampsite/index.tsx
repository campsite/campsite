import { useState } from 'react'
import * as SettingsSection from 'components/SettingsSection'

import { Button, TrashIcon, UIText } from '@campsite/ui'

import { DeleteCampsiteDialog } from './DeleteCampsiteDialog'

export function DeleteCampsite() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  return (
    <>
      <DeleteCampsiteDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
      <SettingsSection.Section>
        <SettingsSection.Header>
          <SettingsSection.Title>Danger Zone</SettingsSection.Title>
        </SettingsSection.Header>

        <SettingsSection.Separator />

        <div className='flex flex-col px-3 pb-3'>
          <div className='flex flex-col items-start gap-4 sm:flex-row sm:items-center'>
            <div className='flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-700 dark:bg-red-700/10 dark:text-red-500'>
              <TrashIcon />
            </div>
            <div className='flex flex-1 flex-col'>
              <UIText weight='font-medium'>Delete organization</UIText>
              <UIText tertiary>There’s no going back. Deleting a organization is permanent.</UIText>
            </div>

            <Button onClick={() => setIsDialogOpen(true)} variant='destructive'>
              Delete this organization
            </Button>
          </div>
        </div>
      </SettingsSection.Section>
    </>
  )
}
