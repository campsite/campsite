import * as SettingsSection from 'components/SettingsSection'
import Image from 'next/image'

import { FIGMA_PLUGIN_URL } from '@campsite/config'
import { Button, CheckIcon, FigmaOutlineIcon, UIText, UploadCloudIcon } from '@campsite/ui'

import { useFigmaAuthorizationUrl } from '@/hooks/useFigmaAuthorizationUrl'
import { useGetCurrentUser } from '@/hooks/useGetCurrentUser'
import { useGetFigmaIntegration } from '@/hooks/useGetFigmaIntegration'
import { useHandleFigmaConnectionSuccess } from '@/hooks/useHandleFigmaConnectionSuccess'
import { useUpdatePreference } from '@/hooks/useUpdatePreference'

interface IntegrationsProps {
  onboarding?: boolean
}

export function FigmaIntegration(_props: IntegrationsProps) {
  const { data: figmaIntegration, refetch: refetchFigmaIntegration } = useGetFigmaIntegration()
  const figmaAuthorizationUrl = useFigmaAuthorizationUrl()
  const { data: currentUser } = useGetCurrentUser()
  const updatePreference = useUpdatePreference()
  const hasOnboardedFigmaPlugin = currentUser?.preferences?.feature_tip_figma_plugin === 'true'

  useHandleFigmaConnectionSuccess(refetchFigmaIntegration)

  return (
    <SettingsSection.Section>
      <SettingsSection.Header>
        <SettingsSection.Title>
          <div className='flex items-center gap-3'>
            <Image src='/img/services/figma-app-icon.png' width='36' height='36' alt='Figma app icon' />
            <span>Figma</span>
          </div>
        </SettingsSection.Title>
      </SettingsSection.Header>

      <SettingsSection.Separator />

      <div className='flex flex-col'>
        <div className='flex items-start gap-3 p-3 pt-0 md:items-center'>
          <div className='bg-quaternary text-primary flex h-8 w-8 flex-none items-center justify-center rounded-full font-mono text-base font-bold'>
            <UploadCloudIcon />
          </div>

          <div className='flex flex-1 flex-col items-start gap-2 md:flex-row md:items-center md:justify-between'>
            <div className='flex flex-1 flex-col'>
              <UIText weight='font-medium'>Share instantly from Figma</UIText>
              <UIText secondary>Share a post or add new versions without leaving the canvas.</UIText>
            </div>
            <Button
              href={FIGMA_PLUGIN_URL}
              variant={hasOnboardedFigmaPlugin ? 'base' : 'primary'}
              externalLink
              onClick={() => {
                updatePreference.mutate({
                  preference: 'feature_tip_figma_plugin',
                  value: 'true'
                })
              }}
            >
              Install the plugin
            </Button>
          </div>
        </div>

        <div className='flex items-start gap-3 border-t p-3 md:items-center'>
          <div className='bg-quaternary text-primary flex h-8 w-8 items-center justify-center rounded-full font-mono text-base font-bold'>
            <FigmaOutlineIcon size={24} />
          </div>
          <div className='flex flex-1 flex-col items-start gap-2 md:flex-row md:items-center md:justify-between'>
            <div className='flex flex-1 flex-col pr-6'>
              <UIText weight='font-medium'>Connect your Figma account</UIText>
              <UIText secondary>
                Automatically generate previews when you share a Figma link so your team can leave comments without
                logging in to Figma.
              </UIText>
            </div>

            {figmaIntegration?.has_figma_integration ? (
              <span className='ml-2 flex items-center gap-1 text-sm font-medium text-green-500'>
                <CheckIcon />
                <span>Connected</span>
              </span>
            ) : (
              <Button allowOpener externalLink variant='primary' href={figmaAuthorizationUrl}>
                Connect to Figma
              </Button>
            )}
          </div>
        </div>
      </div>
    </SettingsSection.Section>
  )
}
