import { FormEvent, useCallback, useState } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { api } from 'src/api'
import { useCommand } from 'src/core/command-context'
import { FormSchema } from 'src/core/schema'

import { Post, SlackChannel } from '@campsite/types/generated'
import { ArrowRightCircleIcon, Button, CheckIcon, ExternalLinkIcon, LinkIcon, SlackIcon } from '@campsite/ui'
import { useCopyToClipboard } from '@campsite/ui/src/hooks'
import { cn } from '@campsite/ui/src/utils'

import { SlackChannelPicker } from './SlackChannelPicker'

export interface SharePromptProps {
  post: Post
}

export function SharePrompt({ post }: SharePromptProps) {
  const [copy, isCopied] = useCopyToClipboard()

  const { control } = useFormContext<FormSchema>()
  const command = useCommand()
  const organization = useWatch({ control, name: 'organization' })

  const { data: me } = api.auth.useMeQuery()
  const { mutate: sharePost } = api.posts.useCreateShare()
  const { mutate: analytics } = api.analytics.useCreateEvents()

  const brodcastsAuthorizationUrl = api.slack.useBroadcastsAuthorizationUrl({ organization })
  const { data: integration } = api.slack.useIntegrationQuery(organization)
  const hasIntegrationWithScopes = !!integration && !integration.only_scoped_for_notifications
  const [channel, setChannel] = useState<SlackChannel | null>(null)

  const handleSlackShare = useCallback(
    (evt: FormEvent) => {
      evt.preventDefault()

      if (!organization || !post || !channel) return

      sharePost(
        { organization, postId: post.id, data: { slack_channel_id: channel.id } },
        {
          onSuccess() {
            analytics({
              name: 'figma_plugin_post_shared',
              data: {
                command: command,
                slack_channel_id: channel.id,
                post_id: post.id
              },
              org_slug: organization,
              user_id: me?.id
            })
          }
        }
      )
    },
    [channel, organization, post, sharePost, analytics, command, me?.id]
  )

  return (
    <div className='flex w-full flex-col gap-3'>
      <div className='w-full'>
        <Button
          variant='base'
          fullWidth
          size='large'
          leftSlot={isCopied ? <CheckIcon /> : <LinkIcon />}
          className={cn({
            '!border-transparent !bg-green-500 !text-white !shadow-none !outline-none !ring-0': isCopied
          })}
          onClick={async (evt) => {
            if (isCopied) return

            const button = evt.currentTarget
            const input = document.createElement('input')

            input.value = post.url
            input.readOnly = true
            input.classList.add('absolute', '-top-100', 'opacity-0')
            document.body.appendChild(input)
            input.select()
            await copy(post.url)

            input.remove()
            button.focus()
          }}
        >
          {isCopied ? 'Copied' : 'Copy link'}
        </Button>
      </div>

      <div className='w-full'>
        <Button variant='primary' fullWidth size='large' leftSlot={<ExternalLinkIcon />} href={post.url} externalLink>
          View post
        </Button>
      </div>

      <hr className='border-gray-200 dark:border-gray-700' />

      {hasIntegrationWithScopes ? (
        <form className='m-0 flex items-center gap-1' onSubmit={handleSlackShare}>
          <SlackChannelPicker channel={channel} onChannelChange={setChannel} />

          <button
            type='submit'
            className={cn('-mr-2', {
              'dark:text-tertiary text-gray-400': !channel,
              'text-blue-500 dark:text-blue-500': !!channel
            })}
            aria-label='Send'
            disabled={!channel}
          >
            <ArrowRightCircleIcon size={36} />
          </button>
        </form>
      ) : (
        <Button
          fullWidth
          size='large'
          leftSlot={<SlackIcon size={16} />}
          onClick={() => {
            window.open(brodcastsAuthorizationUrl, '_blank')
          }}
        >
          Connect Slack to share
        </Button>
      )}
    </div>
  )
}
