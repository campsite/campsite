import { FormEvent, MouseEvent, useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { useInView } from 'react-intersection-observer'

import { Post, SlackChannel } from '@campsite/types'
import {
  ArrowRightCircleIcon,
  Avatar,
  Button,
  CheckIcon,
  GlobeIcon,
  InformationIcon,
  LinkIcon,
  LockIcon,
  PencilIcon,
  ProjectIcon,
  Switch,
  Tooltip,
  UIText
} from '@campsite/ui'
import { useCopyToClipboard } from '@campsite/ui/src/hooks'
import { cn } from '@campsite/ui/src/utils'

import { ConnectSlackButton } from '@/components/OrgSettings/ConnectSlackButton'
import SlackChannelPicker from '@/components/OrgSettings/SlackChannelPicker'
import { PostMoveProjectDialog } from '@/components/Post/PostMoveProjectDialog'
import { useCreatePostShare } from '@/hooks/useCreatePostShare'
import { useGetCurrentOrganization } from '@/hooks/useGetCurrentOrganization'
import { useGetProject } from '@/hooks/useGetProject'
import { useGetSlackIntegration } from '@/hooks/useGetSlackIntegration'
import { useIsOrganizationMember } from '@/hooks/useIsOrganizationMember'
import { useSlackBroadcastsAuthorizationUrl } from '@/hooks/useSlackBroadcastsAuthorizationUrl'
import { useUpdatePostVisibility } from '@/hooks/useUpdatePostVisibility'
import { useViewerIsAdmin } from '@/hooks/useViewerIsAdmin'
import { apiErrorToast } from '@/utils/apiErrorToast'

interface PostShareControlsProps {
  post: Post
  isOpen: boolean
  source?: string
}

export function PostShareControls({ isOpen, post }: PostShareControlsProps) {
  const { data: project } = useGetProject({ id: post?.project.id })
  const { data: integration } = useGetSlackIntegration({ enabled: isOpen })
  const hasIntegrationWithScopes = !!integration && !integration.only_scoped_for_notifications
  const isOrgMember = useIsOrganizationMember()
  const { data: currentOrg } = useGetCurrentOrganization({ enabled: isOrgMember })
  const [copy, isCopied] = useCopyToClipboard()
  const createPostShare = useCreatePostShare(post.id)
  const updatePostVisibility = useUpdatePostVisibility(post.id)
  const [slackChannel, setSlackChannel] = useState<SlackChannel>()
  const slackBroadcastsAuthorizationUrl = useSlackBroadcastsAuthorizationUrl({})
  const viewerIsAdmin = useViewerIsAdmin({ enabled: isOrgMember })
  const [moveProjectDialogIsOpen, setMoveProjectDialogIsOpen] = useState(false)

  const [inViewRef] = useInView({ triggerOnce: true, threshold: 1 })

  useEffect(() => {
    if (project && project.slack_channel) setSlackChannel(project.slack_channel)
  }, [project])

  function handlePublicChange(checked: boolean) {
    updatePostVisibility.mutate({ visibility: checked ? 'public' : 'default' })
  }

  function handleSlackSubmit(e: FormEvent<HTMLFormElement> | MouseEvent<HTMLButtonElement>) {
    e.preventDefault()
    createPostShare.mutate(
      {
        slack_channel_id: slackChannel?.id
      },
      {
        onSuccess: () => {
          toast('Broadcast sent')
          setSlackChannel(undefined)
        },
        onError: apiErrorToast
      }
    )
  }

  function onCopy() {
    if (!isCopied) {
      copy(post.url)
    }
  }

  const isPublic = post.visibility === 'public'
  const canMoveProject = post.viewer_is_author || viewerIsAdmin

  return (
    <>
      {canMoveProject && (
        <PostMoveProjectDialog post={post} open={moveProjectDialogIsOpen} onOpenChange={setMoveProjectDialogIsOpen} />
      )}
      <div ref={inViewRef} className='flex flex-col gap-4 p-4'>
        <div className='flex items-center gap-2'>
          <Avatar urls={currentOrg?.avatar_urls} name={currentOrg?.name} size='xs' />
          <UIText weight='font-medium' className='line-clamp-1 flex min-w-0 flex-1'>
            <span className='truncate'>{currentOrg?.name}</span>
          </UIText>
          <UIText className='flex-none' tertiary>
            {post.project.private ? 'No access' : 'View + comment'}
          </UIText>
        </div>

        <div className='flex items-center justify-between gap-2'>
          <span className='flex min-w-0 shrink items-center gap-2'>
            <span className='text-secondary flex h-5 w-5 items-center justify-center'>
              {post.project.accessory ? (
                <UIText className='font-["emoji"]' size='text-base' inherit>
                  {post.project.accessory}
                </UIText>
              ) : (
                <ProjectIcon />
              )}
            </span>

            <span title={post.project.name} className='flex min-w-0 shrink items-center gap-1 whitespace-nowrap'>
              <UIText weight='font-medium' className='flex min-w-0 items-center'>
                <span className='truncate'>{post.project.name}</span>
              </UIText>
              {post.project.private && (
                <Tooltip label='Private'>
                  <span>
                    <LockIcon className='text-tertiary flex-none' size={16} />
                  </span>
                </Tooltip>
              )}
              {canMoveProject && (
                <Tooltip label='Move to channel...'>
                  <button
                    // this is the first focusable element in the popover; without this, the tooltip would be open by default
                    tabIndex={-1}
                    className='text-tertiary hover:text-primary'
                    onClick={() => setMoveProjectDialogIsOpen(true)}
                  >
                    <PencilIcon size={16} className='flex-none' />
                  </button>
                </Tooltip>
              )}
            </span>
          </span>

          <UIText tertiary className='flex-none'>
            View + comment
          </UIText>
        </div>

        <div className='flex items-start gap-2'>
          <span className='text-secondary'>
            <GlobeIcon />
          </span>
          <div className='flex-1 flex-col'>
            <UIText weight='font-medium'>Anyone with the link can view</UIText>
          </div>
          <span className='-mt-0.5'>
            <Switch checked={isPublic} onChange={handlePublicChange} />
          </span>
        </div>

        {/* wrapping div needed to prevent the button from flexing vertically */}
        <div>
          <Button
            variant='primary'
            fullWidth
            tooltipShortcut='mod+shift+c'
            onClick={onCopy}
            leftSlot={isCopied ? <CheckIcon /> : <LinkIcon />}
            className={cn({
              '!border-transparent !bg-green-500 !text-white !shadow-none !outline-none !ring-0': isCopied
            })}
          >
            {isCopied ? 'Copied' : 'Copy link'}
          </Button>
        </div>

        {(!post.project.private || post.visibility === 'public') && <div className='h-px w-full flex-none border-b' />}

        {(!post.project.private || post.visibility === 'public') && (
          <div className='flex flex-col gap-2'>
            {hasIntegrationWithScopes ? (
              <form onSubmit={handleSlackSubmit} className='flex items-center gap-1'>
                <div className='flex-1'>
                  <SlackChannelPicker activeId={slackChannel?.id} onChange={setSlackChannel} includeSlackIcon />
                </div>
                <button
                  type='submit'
                  className={cn('-mr-2', {
                    'dark:text-tertiary text-gray-400': !slackChannel,
                    'text-blue-500 dark:text-blue-500': slackChannel
                  })}
                  aria-label='Send'
                  disabled={!slackChannel}
                >
                  <ArrowRightCircleIcon size={36} />
                </button>
              </form>
            ) : (
              <ConnectSlackButton href={slackBroadcastsAuthorizationUrl} />
            )}

            {post.project.private && post.visibility === 'public' && (
              <div className='-mx-4 -mb-4 mt-2 flex items-start gap-2 rounded-b-lg border-t border-yellow-300 bg-yellow-100 p-4 text-yellow-800 dark:border-yellow-900/70 dark:bg-yellow-800/30 dark:text-yellow-400'>
                <span className='flex-none'>
                  <InformationIcon />
                </span>
                <UIText inherit>
                  This post is in a private channel — when you share it in a Slack broadcast, recipients will see a
                  preview of the post.
                </UIText>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}
