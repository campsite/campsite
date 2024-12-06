import Image from 'next/image'

import { Button, cn, SparklesIcon, UIText } from '@campsite/ui'

import * as SettingsSection from '@/components/SettingsSection'
import { useCurrentUserOrOrganizationHasFeature } from '@/hooks/useCurrentUserOrOrganizationHasFeature'
import { useGetSlackIntegration } from '@/hooks/useGetSlackIntegration'
import { useSlackBroadcastsAuthorizationUrl } from '@/hooks/useSlackBroadcastsAuthorizationUrl'

import { ConnectSlackButton } from './ConnectSlackButton'
import { DisconnectSlackConfirmationDialog } from './DisconnectSlackConfirmationDialog'

export function SlackIntegration() {
  const { data: slackIntegration, isLoading } = useGetSlackIntegration()
  const hasSlackIntegrationWithScopes = slackIntegration && !slackIntegration.only_scoped_for_notifications
  const slackBroadcastsAuthorizationUrl = useSlackBroadcastsAuthorizationUrl({})
  const needsScopeUpgrade =
    slackIntegration && (!slackIntegration.has_link_unfurling_scopes || !slackIntegration?.has_private_channel_scopes)
  const hasSlackAutoPublish = useCurrentUserOrOrganizationHasFeature('slack_auto_publish')

  // hide feature unless the flag is on or you already have a slack integration
  if (!hasSlackAutoPublish && !slackIntegration) return null

  if (hasSlackIntegrationWithScopes) {
    return (
      <SettingsSection.Section>
        <SettingsSection.Header className={cn(!needsScopeUpgrade && 'p-3')}>
          <Image src='/img/services/slack-app-icon.png' width='36' height='36' alt='Slack app icon' />

          <div className='flex flex-1 flex-col'>
            <SettingsSection.Title className='flex-1'>Slack</SettingsSection.Title>

            <SettingsSection.Description className='m-0 p-0'>
              Share posts to a Slack channel to keep your team in the loop.
            </SettingsSection.Description>
          </div>

          <DisconnectSlackConfirmationDialog />
        </SettingsSection.Header>

        {needsScopeUpgrade && (
          <>
            <SettingsSection.Separator />

            <div className='flex flex-col gap-3 px-3 pb-3'>
              {needsScopeUpgrade && (
                <div className='flex flex-col items-start justify-between gap-2 space-y-3 rounded-md bg-blue-50 p-4 sm:flex-row sm:items-center sm:gap-4 sm:space-y-0 dark:bg-blue-900/30'>
                  <div className='flex flex-1 items-start space-x-3'>
                    <div className='flex-none text-blue-900 dark:text-blue-100'>
                      <SparklesIcon />
                    </div>
                    <div className='flex flex-col text-blue-900 dark:text-blue-100'>
                      <UIText weight='font-medium' inherit>
                        Upgrade Slack app
                      </UIText>
                      <UIText inherit>
                        The latest version unfurls links you share to provide rich post previews and can broadcast to
                        private channels.
                      </UIText>
                    </div>
                  </div>
                  <div className='pl-8 sm:pl-0'>
                    <Button variant='important' externalLink href={slackBroadcastsAuthorizationUrl}>
                      Upgrade
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </SettingsSection.Section>
    )
  }

  return (
    <SettingsSection.Section>
      <SettingsSection.Header className='p-3'>
        <Image src='/img/services/slack-app-icon.png' width='36' height='36' alt='Slack app icon' />

        <div className='flex flex-1 flex-col'>
          <SettingsSection.Title className='flex-1'>Slack</SettingsSection.Title>

          <SettingsSection.Description className='m-0 p-0'>
            Share posts to a Slack channel to keep your team in the loop.
          </SettingsSection.Description>
        </div>

        {!isLoading && <ConnectSlackButton href={slackBroadcastsAuthorizationUrl} />}
      </SettingsSection.Header>
    </SettingsSection.Section>
  )
}
