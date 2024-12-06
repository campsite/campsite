import toast from 'react-hot-toast'

import { Button, UIText } from '@campsite/ui'

import * as SettingsSection from '@/components/SettingsSection'
import { useCreateDataExport } from '@/hooks/useCreateDataExport'
import { useCurrentUserOrOrganizationHasFeature } from '@/hooks/useCurrentUserOrOrganizationHasFeature'

export function DataExport() {
  const { mutate: createDataExport } = useCreateDataExport()
  const hasExport = useCurrentUserOrOrganizationHasFeature('export')

  if (!hasExport) {
    return null
  }

  return (
    <SettingsSection.Section>
      <SettingsSection.Header className='p-3'>
        <SettingsSection.Title className='flex-1'>
          <div className='flex w-full items-center gap-3'>
            <div className='flex flex-col'>
              <span className='flex-1'>Export your data</span>
              <UIText tertiary>
                Export all posts, docs, and call recordings that are in public channels. Content in private channels, or
                content that hasn’t been shared (like private docs) will not be included in this export.
              </UIText>
            </div>
          </div>
        </SettingsSection.Title>

        <Button
          variant='base'
          externalLink
          allowOpener
          onClick={() => {
            createDataExport(null, { onSuccess: () => toast('A download link will be emailed to you shortly.') })
          }}
        >
          Export
        </Button>
      </SettingsSection.Header>
    </SettingsSection.Section>
  )
}
