import Image from 'next/image'
import toast from 'react-hot-toast'

import { Button, UIText } from '@campsite/ui'

import { DisconnectLinearConfirmationDialog } from '@/components/OrgSettings/DisconnectLinearIntegrationDialog'
import * as SettingsSection from '@/components/SettingsSection'
import { useGetLinearIntegration } from '@/hooks/useGetLinearIntegration'
import { useHandleLinearConnectionSuccess } from '@/hooks/useHandleLinearConnectionSuccess'
import { useLinearAuthorizationUrl } from '@/hooks/useLinearAuthorizationUrl'

export function LinearIntegration() {
  const callbackUrl = useLinearAuthorizationUrl()
  const { data: hasIntegration, refetch } = useGetLinearIntegration()

  useHandleLinearConnectionSuccess(() => {
    refetch()
    toast('Linear connected', { id: 'linear-connected' })
  })

  return (
    <SettingsSection.Section>
      <SettingsSection.Header className='p-3'>
        <SettingsSection.Title className='flex-1'>
          <div className='flex w-full items-center gap-3'>
            <Image src='/img/services/linear-app-icon.png' width='36' height='36' alt='Figma app icon' />
            <div className='flex flex-col'>
              <span className='flex-1'>Linear</span>
              <UIText tertiary>Create and connect Linear issues from posts and comments.</UIText>
            </div>
          </div>
        </SettingsSection.Title>

        {hasIntegration ? (
          <DisconnectLinearConfirmationDialog />
        ) : (
          <Button
            variant='base'
            href={callbackUrl}
            externalLink
            allowOpener
            onClick={(e) => {
              if (callbackUrl.includes(':3001')) {
                e.preventDefault()
                e.stopPropagation()
                alert('Localhost detected; this button will not work. Please connect using the ngrok app.')
              }
            }}
          >
            Connect to Linear
          </Button>
        )}
      </SettingsSection.Header>
    </SettingsSection.Section>
  )
}
