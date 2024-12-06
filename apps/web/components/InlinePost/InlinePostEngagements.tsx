import pluralize from 'pluralize'

import { Post } from '@campsite/types'
import { UIText } from '@campsite/ui'

import { FacePile } from '@/components/FacePile'
import { DisplayType } from '@/components/InlinePost'
import { PostLink } from '@/components/Post/PostLink'
import { PostViewersPopover } from '@/components/Post/PostViewersPopover'

import { PAGE_COMMENTS_ID } from '../Post/PostView'

function totalViews(post: Post) {
  return post.views_count + post.non_member_views_count
}

function totalFollowUps(post: Post) {
  return post.follow_ups.length
}

export function InlinePostEngagements({ display, post }: { display: DisplayType; post: Post }) {
  if (display === 'feed') {
    return <FeedPostEngagements post={post} />
  } else if (display === 'page') {
    return null
  } else if (display === 'preview') {
    return <PreviewPostEngagements post={post} />
  } else {
    return null
  }
}

function FeedPostEngagements({ post }: { post: Post }) {
  const viewCount = totalViews(post)
  const followUpCount = totalFollowUps(post)

  if (post.comments_count === 0 && viewCount === 0 && followUpCount === 0) return null

  return (
    <>
      <div className='flex flex-wrap items-center gap-1.5'>
        {post.comments_count > 0 && <PostCommenters post={post} />}

        {post.comments_count > 0 && viewCount > 0 && <UIText quaternary>{' · '}</UIText>}

        {viewCount > 0 && <CompactPostViewers post={post} />}

        {(post.comments_count > 0 || viewCount > 0) && followUpCount > 0 && <UIText quaternary>{' · '}</UIText>}

        {followUpCount > 0 && <CompactPostFollowUps post={post} />}
      </div>
    </>
  )
}

function PreviewPostEngagements({ post }: { post: Post }) {
  const viewCount = totalViews(post)
  const followUpCount = totalFollowUps(post)

  if (post.comments_count === 0 && viewCount === 0) return null

  return (
    <div className='flex items-center gap-1.5'>
      {post.comments_count > 0 && <PagePostCommenters post={post} />}

      {post.comments_count > 0 && viewCount > 0 && <UIText quaternary>{' · '}</UIText>}

      {viewCount > 0 && <CompactPostViewers post={post} />}

      {(post.comments_count > 0 || viewCount > 0) && followUpCount > 0 && <UIText quaternary>{' · '}</UIText>}

      {followUpCount > 0 && <CompactPostFollowUps post={post} />}

      {(post.comments_count > 0 || viewCount > 0 || followUpCount > 0) && post.grouped_reactions.length > 0 && (
        <UIText quaternary>{' · '}</UIText>
      )}

      {post.grouped_reactions.length > 0 && <CompactPostReactions post={post} />}
    </div>
  )
}

function CompactPostViewers({
  post,
  side = 'top',
  align = 'start'
}: {
  post: Post
  side?: 'top' | 'bottom' | 'left' | 'right'
  align?: 'start' | 'center' | 'end'
}) {
  const viewCount = totalViews(post)

  if (viewCount === 0) return null

  return (
    <PostViewersPopover modal side={side} align={align} post={post} display='viewers'>
      <button
        type='button'
        className='text-quaternary dark:text-tertiary flex cursor-pointer items-center gap-0.5 hover:underline'
      >
        <UIText inherit>
          {viewCount} {pluralize('view', viewCount)}
        </UIText>
      </button>
    </PostViewersPopover>
  )
}

function CompactPostFollowUps({ post }: { post: Post }) {
  const followUpCount = totalFollowUps(post)

  if (followUpCount === 0 || !post.viewer_is_organization_member) return null

  return (
    <PostViewersPopover modal side='top' align='start' display='follow-ups' post={post}>
      <button
        type='button'
        className='text-quaternary dark:text-tertiary flex cursor-pointer items-center gap-0.5 hover:underline'
      >
        <UIText inherit>
          {followUpCount} {pluralize('follow-up', followUpCount)}
        </UIText>
      </button>
    </PostViewersPopover>
  )
}

function CompactPostReactions({ post }: { post: Post }) {
  if (post.grouped_reactions.length === 0) return null

  const reactionsCount = post.grouped_reactions.reduce((acc, reaction) => acc + reaction.reactions_count, 0)

  return (
    <PostLink postId={post.id} className='flex items-center gap-2 focus:ring-0'>
      <span className='text-quaternary dark:text-tertiary flex items-center gap-0.5 hover:underline'>
        <UIText inherit>
          {reactionsCount} {pluralize('reaction', reactionsCount)}
        </UIText>
      </span>
    </PostLink>
  )
}

function PostCommenters({ post }: { post: Post }) {
  const commenters = post?.preview_commenters?.latest_commenters ?? []
  const users = commenters.map((commenter) => commenter?.user).filter((member) => !!member)
  const hasNew = !!post.unseen_comments_count && post.unseen_comments_count > 0

  if (post.comments_count === 0) return null

  return (
    <PostLink
      hash={hasNew ? '#comments-end' : '#comments'}
      postId={post.id}
      className='flex items-center gap-2 focus:ring-0'
    >
      <FacePile users={users} limit={3} size='xs' />
      <span className='text-quaternary dark:text-tertiary flex items-center gap-0.5 hover:underline'>
        <UIText inherit>
          {post.comments_count} {pluralize('comment', post.comments_count)}
        </UIText>
        {hasNew && (
          <span className='ml-1 rounded-full bg-blue-500 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-white'>
            new
          </span>
        )}
      </span>
    </PostLink>
  )
}

export function scrollCommentsIntoView(block: 'start' | 'end') {
  const element = document.getElementById(PAGE_COMMENTS_ID)

  // wait one render tick so that comments render on the page
  setTimeout(() => {
    element?.scrollIntoView({ behavior: 'smooth', block })
  }, 1)
}

function PagePostCommenters({ post }: { post: Post }) {
  if (post.comments_count === 0) return null

  return (
    <button
      type='button'
      onClick={() => scrollCommentsIntoView('start')}
      className='flex items-center gap-2 focus:ring-0'
    >
      <span className='text-quaternary dark:text-tertiary flex items-center gap-0.5 hover:underline'>
        <UIText inherit>
          {post.comments_count} {pluralize('comment', post.comments_count)}
        </UIText>
      </span>
    </button>
  )
}
