import { memo, useState } from 'react'
import { format } from 'date-fns'
import { AnimatePresence, m } from 'framer-motion'
import { isMobile } from 'react-device-detect'

import { Post } from '@campsite/types/generated'
import { Badge, cn, ConditionalWrap, FollowUpTag, HighlightedCommandItem, UIText } from '@campsite/ui'

import { AuthorLink } from '@/components/AuthorLink'
import { MemberHovercard } from '@/components/InlinePost/MemberHovercard'
import { MemberAvatar } from '@/components/MemberAvatar'
import { PostOverflowMenu } from '@/components/Post/PostOverflowMenu'
import { PostTldrPopover } from '@/components/Post/PostTldrPopover'
import { useHandleCommandListSubjectSelect } from '@/components/Projects/hooks/useHandleHighlightedItemSelect'
import { ProjectTag } from '@/components/ProjectTag'
import { encodeCommandListSubject } from '@/utils/commandListSubject'
import { getPostFallbackTitle } from '@/utils/project'

interface CompactPostProps {
  post: Post
  display?: 'default' | 'pinned' | 'search'
  hideProject?: boolean
}

export const CompactPost = memo(({ post, display = 'default', hideProject = false }: CompactPostProps) => {
  const isIntegration = post.member.user.integration
  const hasComments = post.comments_count > 0
  const unreadPost = !post.viewer_has_viewed && !post.viewer_is_author
  const unreadComments = hasComments && post.unseen_comments_count > 0
  const linkTarget =
    !unreadPost && post.latest_comment_path && !post.viewer_is_latest_comment_author
      ? post.latest_comment_path
      : post.path
  const [tldrOpen, setTldrOpen] = useState(false)
  const { handleSelect } = useHandleCommandListSubjectSelect()

  const title = post.title || `Post by ${post.member.user.display_name}`
  const descriptionFallback = post.truncated_description_text || (!title ? getPostFallbackTitle(post) : '')
  let description = post.viewer_has_viewed ? post.latest_comment_preview || descriptionFallback : descriptionFallback

  // pinned posts always show the description
  if (display === 'pinned') {
    description = post.truncated_description_text
  } else if (display === 'search') {
    description = format(post.created_at, 'MMM d, yyyy')
  }

  return (
    <div className='@xl:px-4 group relative flex min-h-12 items-center gap-3 rounded-lg p-3'>
      <PostOverflowMenu type='context' post={post} onTldrOpen={() => setTldrOpen(true)}>
        <HighlightedCommandItem
          className='absolute inset-0 z-0'
          value={encodeCommandListSubject(post, { href: linkTarget, pinned: display === 'pinned' })}
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

      <div className='@xl:flex-row @xl:items-center @xl:gap-3 flex flex-1 flex-col-reverse items-start gap-0.5'>
        <div className='flex flex-1 items-center'>
          <PostTldrPopover postId={post.id} open={tldrOpen} onOpenChange={setTldrOpen}>
            <div className='flex flex-1 flex-col gap-0.5'>
              <div className='flex flex-shrink items-center'>
                <VersionBadge post={post} />

                <AnimatePresence initial={false}>
                  {unreadPost && (
                    <m.div
                      initial={{ opacity: 0, marginRight: -10 }}
                      animate={{ opacity: 1, marginRight: 10 }}
                      exit={{ opacity: 0, marginRight: -10 }}
                      className='h-2.5 w-2.5 flex-none rounded-full bg-blue-500'
                    />
                  )}
                </AnimatePresence>

                {title && (
                  <UIText primary weight='font-medium' className='break-anywhere mr-2 line-clamp-1 text-[15px]'>
                    {title}
                  </UIText>
                )}
              </div>

              <div className='flex items-center'>
                <DescriptionStatusBadges post={post} />

                {display !== 'pinned' && hasComments && (
                  <span
                    className={cn(
                      'h-4.5 mr-2 mt-px flex items-center justify-center self-start rounded px-1.5 text-[10px] font-semibold uppercase',
                      {
                        'bg-blue-500 text-white': unreadComments,
                        'text-tertiary bg-black/[0.04] dark:bg-white/10': !unreadComments
                      }
                    )}
                  >
                    {post.comments_count}
                  </span>
                )}

                {description && (
                  <UIText tertiary className='break-anywhere line-clamp-1 flex-1'>
                    {description}
                  </UIText>
                )}

                {!description && (
                  <UIText tertiary className='break-anywhere line-clamp-1 flex-1'>
                    {post.latest_comment_preview}
                  </UIText>
                )}
              </div>
            </div>
          </PostTldrPopover>
        </div>

        {!hideProject && (
          <div className='@xl:self-center self-start'>
            <ProjectTag tabIndex={-1} project={post.project} />
          </div>
        )}
      </div>
    </div>
  )
})
CompactPost.displayName = 'CompactPost'

function VersionBadge({ post }: { post: Post }) {
  if (!post.has_parent) return null

  return (
    <Badge
      className={cn('mr-1.5 shrink-0 rounded font-mono', {
        relative: !isMobile
      })}
    >
      v{post.version}
    </Badge>
  )
}

function DescriptionStatusBadges({ post }: { post: Post }) {
  const viewersFeedbackRequest = post.viewer_feedback_status === 'viewer_requested'
  const anyFeedbackRequest = post.viewer_feedback_status === 'open' && !post.viewer_has_commented
  const viewerFollowUp = post.follow_ups.find((followUp) => followUp.belongs_to_viewer)

  if (!viewersFeedbackRequest && !anyFeedbackRequest && !viewerFollowUp && !post.resolution) return null

  return (
    <span className='mr-1.5 flex items-center gap-1.5'>
      {post.resolution && <Badge color='green'>Resolved</Badge>}
      {!post.resolution && viewersFeedbackRequest && <Badge color='brand'>Needs feedback</Badge>}
      {!post.resolution && anyFeedbackRequest && <Badge color='default'>Needs feedback</Badge>}

      <FollowUpTag followUpAt={viewerFollowUp?.show_at} />
    </span>
  )
}
