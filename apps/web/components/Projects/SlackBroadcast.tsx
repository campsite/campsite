import { UIText } from '@campsite/ui'

import { useCurrentUserOrOrganizationHasFeature } from '@/hooks/useCurrentUserOrOrganizationHasFeature'
import { useGetSlackIntegration } from '@/hooks/useGetSlackIntegration'
import { useSlackBroadcastsAuthorizationUrl } from '@/hooks/useSlackBroadcastsAuthorizationUrl'

import { ConnectSlackButton } from '../OrgSettings/ConnectSlackButton'
import SlackChannelPicker from '../OrgSettings/SlackChannelPicker'

interface Props {
  open: boolean
  isAdmin: boolean
  slackChannelId: string | null | undefined
  setSlackChannelId: (id: string | null) => void
  setSlackChannelIsPrivate: (isPrivate: boolean) => void
}

export function SlackBroadcast({ isAdmin, slackChannelId, setSlackChannelId, setSlackChannelIsPrivate, open }: Props) {
  const { data: integration } = useGetSlackIntegration({ enabled: open })
  const slackBroadcastsAuthorizationUrl = useSlackBroadcastsAuthorizationUrl({})
  const hasSlackAutoPublish = useCurrentUserOrOrganizationHasFeature('slack_auto_publish')

  const hasIntegrationWithScopes = integration && !integration.only_scoped_for_notifications
  const canShow = hasSlackAutoPublish && (isAdmin || hasIntegrationWithScopes)

  if (!canShow) return null

  return (
    <div className='flex w-full flex-col gap-1.5 pb-2'>
      <UIText secondary size='text-xs' weight='font-medium'>
        Cross-post to Slack
      </UIText>
      {hasIntegrationWithScopes ? (
        <SlackChannelPicker
          onChange={(channel) => {
            setSlackChannelId(channel?.id ?? null)
            setSlackChannelIsPrivate(!!channel?.is_private)
          }}
          includeSlackIcon
          activeId={slackChannelId}
        />
      ) : (
        <ConnectSlackButton href={slackBroadcastsAuthorizationUrl} />
      )}
      <UIText size='text-xs' tertiary>
        Automatically cross-post to a Slack channel when someone posts in this channel.
      </UIText>
    </div>
  )
}
