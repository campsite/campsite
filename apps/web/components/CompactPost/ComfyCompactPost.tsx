import { forwardRef, memo, useMemo, useState } from 'react'
import { useFocusVisible } from 'react-aria'

import { Post, SyncCustomReaction } from '@campsite/types/generated'
import {
  Badge,
  Button,
  cn,
  ConditionalWrap,
  FaceSmilePlusIcon,
  HighlightedCommandItem,
  Link,
  LockIcon,
  UIText
} from '@campsite/ui'

import { AuthorLink } from '@/components/AuthorLink'
import { FacePile } from '@/components/FacePile'
import { MemberHovercard } from '@/components/InlinePost/MemberHovercard'
import { ProjectHovercard } from '@/components/InlinePost/ProjectHovercard'
import { MemberAvatar } from '@/components/MemberAvatar'
import { PostOverflowMenu } from '@/components/Post/PostOverflowMenu'
import { PostTldrPopover } from '@/components/Post/PostTldrPopover'
import { useHandleCommandListSubjectSelect } from '@/components/Projects/hooks/useHandleHighlightedItemSelect'
import { Reactions } from '@/components/Reactions'
import { ReactionPicker } from '@/components/Reactions/ReactionPicker'
import { AttachmentCard } from '@/components/Thread/Bubble/AttachmentCard'
import { useScope } from '@/contexts/scope'
import { useCanHover } from '@/hooks/useCanHover'
import { useCreatePostReaction } from '@/hooks/useCreatePostReaction'
import { useCreatePostView } from '@/hooks/useCreatePostView'
import { useDeleteReaction } from '@/hooks/useDeleteReaction'
import { isRenderable } from '@/utils/attachments'
import { encodeCommandListSubject } from '@/utils/commandListSubject'
import { findGroupedReaction, StandardReaction } from '@/utils/reactions'

interface Props {
  post: Post
  hideProject?: boolean
  hideReactions?: boolean
  hideAttachments?: boolean
  hideComments?: boolean
}

export const ComfyCompactPost = memo(
  ({ post, hideProject = false, hideReactions = false, hideAttachments = false, hideComments = false }: Props) => {
    const isIntegration = post.member.user.integration
    const unreadPost = !post.viewer_has_viewed && !post.viewer_is_author
    const [tldrOpen, setTldrOpen] = useState(false)
    const { handleSelect } = useHandleCommandListSubjectSelect()

    const title = post.title || `Post by ${post.member.user.display_name}`

    return (
      <div className='@xl:px-4 group relative flex min-h-12 items-center gap-3 rounded-lg px-2 py-3'>
        <PostOverflowMenu type='context' post={post} onTldrOpen={() => setTldrOpen(true)}>
          <HighlightedCommandItem
            className='absolute inset-0 z-0'
            value={encodeCommandListSubject(post, { href: post.path })}
            onSelect={handleSelect}
          />
        </PostOverflowMenu>

        <div className='mt-0.5 flex items-start self-start'>
          <ConditionalWrap
            condition={post.viewer_is_organization_member && !isIntegration}
            wrap={(c) => (
              <MemberHovercard username={post.member.user.username as string}>
                <AuthorLink tabIndex={-1} className='not-prose rounded-full' user={post.member.user}>
                  {c}
                </AuthorLink>
              </MemberHovercard>
            )}
          >
            <MemberAvatar member={post.member} size='lg' />
          </ConditionalWrap>
        </div>

        <PostTldrPopover postId={post.id} open={tldrOpen} onOpenChange={setTldrOpen}>
          <div className='flex flex-1 flex-col gap-2'>
            <div className='flex flex-col gap-0.5'>
              {!hideProject && (
                <span className='self-start'>
                  <ProjectTag tabIndex={-1} project={post.project} />
                </span>
              )}

              <div className='flex w-full items-center justify-between gap-2'>
                <div className='flex items-center gap-1.5'>
                  <UIText primary weight='font-medium' className='break-anywhere mr-2 line-clamp-2 text-[15px]'>
                    {title}
                  </UIText>
                  {unreadPost && <Badge color='blue'>New</Badge>}
                  <DescriptionStatusBadge post={post} />
                </div>
              </div>

              {post.truncated_description_text && (
                <UIText tertiary className='break-anywhere line-clamp-2 flex-1'>
                  {post.truncated_description_text}
                </UIText>
              )}
            </div>

            {!hideComments && <PostCommenters post={post} />}

            {!hideReactions && <PostReactions post={post} />}
          </div>
        </PostTldrPopover>

        {!hideAttachments && post.attachments.length > 0 && <Attachments post={post} />}

        <PostHoverActions post={post} />
      </div>
    )
  }
)
ComfyCompactPost.displayName = 'ComfyCompactPost'

function DescriptionStatusBadge({ post }: { post: Post }) {
  if (post.resolution) {
    return <Badge color='green'>Resolved</Badge>
  }

  if (post.viewer_feedback_status === 'viewer_requested') {
    return <Badge color='brand'>Needs feedback</Badge>
  }

  if (post.viewer_feedback_status === 'open' && !post.viewer_has_commented) {
    return <Badge color='default'>Needs feedback</Badge>
  }

  return null
}

type ProjectTagElement = React.ElementRef<typeof Link>
interface ProjectTagProps extends Omit<React.ComponentPropsWithoutRef<typeof Link>, 'href'> {
  project: {
    id: string
    name: string
    private: boolean
    accessory?: string | null
  }
}

const ProjectTag = forwardRef<ProjectTagElement, ProjectTagProps>(({ project, ...props }, ref) => {
  const { scope } = useScope()

  return (
    <ProjectHovercard projectId={project.id} side='top' align='center'>
      <Link
        {...props}
        ref={ref}
        className='hover:text-primary text-quaternary relative flex items-center gap-1'
        href={`/${scope}/projects/${project.id}`}
      >
        {project.accessory && (
          <UIText className='mr-px font-["emoji"] text-xs leading-none'>{project.accessory}</UIText>
        )}
        <UIText className='flex-none' size='text-sm @xl:text-xs' inherit>
          {project.name}
        </UIText>
        {project.private && <LockIcon size={14} className='opacity-80' />}
      </Link>
    </ProjectHovercard>
  )
})

ProjectTag.displayName = 'ProjectTag'

function PostCommenters({ post }: { post: Post }) {
  if (post.comments_count === 0 || post.latest_comment_path == null) return null

  const commenters = post?.preview_commenters?.latest_commenters ?? []
  const users = commenters.map((commenter) => commenter?.user).filter((member) => !!member)
  // if only one seen comment, don't show the redundant count
  const showCount = post.comments_count > 1 || post.unseen_comments_count > 0

  return (
    <Link
      href={post.latest_comment_path}
      className='group/post-commenters relative flex items-center gap-1.5 focus:ring-0'
    >
      <FacePile users={users} limit={3} size='xs' showTooltip={false} />

      {showCount && (
        <span
          className={cn(
            'h-4.5 mt-px flex min-w-4 items-center justify-center self-start rounded px-1 text-[10px] font-semibold uppercase',
            {
              'bg-blue-50 font-extrabold text-blue-500 dark:bg-blue-500/20 dark:text-blue-400':
                post.unseen_comments_count > 0,
              'text-tertiary group-hover/post-commenters:text-secondary bg-black/[0.04] group-hover/post-commenters:bg-black/[0.06] dark:bg-white/10 group-hover/post-commenters:dark:bg-white/15':
                post.unseen_comments_count === 0
            }
          )}
        >
          {post.unseen_comments_count > 0 ? `+${post.unseen_comments_count}` : post.comments_count}
        </span>
      )}

      <UIText className='break-anywhere group-hover/post-commenters:text-primary text-tertiary line-clamp-1 flex-1'>
        {post.latest_comment_preview}
      </UIText>
    </Link>
  )
}

function usePostReactions({ post }: { post: Post }) {
  const createReaction = useCreatePostReaction(post.id)
  const deleteReaction = useDeleteReaction()
  const createPostView = useCreatePostView()

  function handleCreateReaction(reaction: StandardReaction | SyncCustomReaction) {
    createReaction.mutate({ reaction })
    createPostView.mutate({ postId: post.id, read: true })
  }

  function handleDeleteReaction(id: string) {
    deleteReaction.mutate({ id, type: 'post', postId: post.id })
  }

  function handleReactionSelect(reaction: StandardReaction | SyncCustomReaction) {
    if (!post) return
    if (!post.viewer_is_organization_member) return null

    const groupedReaction = findGroupedReaction(post.grouped_reactions, reaction)

    if (groupedReaction?.viewer_reaction_id) {
      handleDeleteReaction(groupedReaction.viewer_reaction_id)
    } else {
      handleCreateReaction(reaction)
    }
  }

  return handleReactionSelect
}
function PostReactions({ post }: { post: Post }) {
  const handleReactionSelect = usePostReactions({ post })

  function getClasses(hasReacted: boolean) {
    return cn(
      'flex gap-[5px] pointer-events-auto items-center p-0.5 pl-1.5 pr-2 justify-center group h-6.5 rounded-full text-xs font-semibold ring-1 min-w-[32px]',
      {
        'bg-blue-50 dark:bg-blue-900/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-900 dark:text-blue-400':
          hasReacted,
        'bg-tertiary hover:bg-quaternary': !hasReacted,
        'cursor-pointer': post.viewer_is_organization_member,
        'cursor-default': !post.viewer_is_organization_member
      }
    )
  }

  if (!post.grouped_reactions.length) return null

  return (
    <div className='-ml-1 flex flex-wrap items-center gap-1'>
      {post.viewer_is_organization_member && (
        <ReactionPicker
          custom
          trigger={
            <Button
              className='hover:text-primary text-tertiary px-0.5'
              round
              size='sm'
              variant='plain'
              iconOnly={<FaceSmilePlusIcon />}
              accessibilityLabel='Add reaction'
            />
          }
          onReactionSelect={handleReactionSelect}
        />
      )}
      <Reactions reactions={post.grouped_reactions} onReactionSelect={handleReactionSelect} getClasses={getClasses} />
    </div>
  )
}

function PostHoverActions({ post }: { post: Post }) {
  const canHover = useCanHover()
  const { isFocusVisible } = useFocusVisible()
  const handleReactionSelect = usePostReactions({ post })

  return (
    <div
      className={cn(
        'initial:opacity-0 bg-elevated absolute right-2 top-1 flex flex-none -translate-y-1/2 items-center justify-end rounded-lg border p-0.5 shadow transition-opacity',
        'group-hover:opacity-100 [&:has(button[aria-expanded="true"])]:opacity-100 [@media(hover:none)]:opacity-100',
        {
          'focus-within:opacity-100': isFocusVisible,
          'opacity-100': !canHover
        },
        'group-has-[&_[data-state="open"]]:opacity-100'
      )}
    >
      {post.viewer_is_organization_member && (
        <ReactionPicker
          custom
          align='end'
          trigger={
            <Button
              variant='plain'
              iconOnly={<FaceSmilePlusIcon />}
              accessibilityLabel='Add reaction'
              tooltip='Add reaction'
            />
          }
          onReactionSelect={handleReactionSelect}
        />
      )}

      <PostOverflowMenu post={post} type='dropdown' />
    </div>
  )
}

function Attachments({ post }: { post: Post }) {
  const renderables = useMemo(() => post.attachments.filter(isRenderable), [post.attachments])

  if (renderables.length === 0) return null

  const attachment = renderables[0]
  const overflow = renderables.length - 1
  const aspectRatio = (attachment.width || 1) / (attachment.height || 1)

  return (
    <div
      key={attachment.id}
      className='bg-elevated max-w-30 max-h-22 pointer-events-none relative flex-1 self-center rounded-lg ring-1 ring-inset ring-[--border-primary]'
      style={{ aspectRatio }}
    >
      <div className='flex h-full w-full items-center justify-center overflow-hidden rounded-lg'>
        <AttachmentCard attachment={attachment} autoplay={false} />
      </div>

      {overflow > 0 && (
        <div className='absolute bottom-1 right-1 flex h-5 w-5 items-center justify-center overflow-hidden rounded-md bg-black/50 backdrop-blur-lg'>
          <UIText className='text-primary dark z-[1] select-none' size='text-xs'>
            {renderables.length}
          </UIText>
        </div>
      )}
    </div>
  )
}
