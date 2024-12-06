import { Post } from '@campsite/types'
import { Badge, Button, DotsHorizontal, Link, LockIcon, RelativeTime, Tooltip, UIText } from '@campsite/ui'
import { cn, ConditionalWrap } from '@campsite/ui/src/utils'

import { AuthorLink } from '@/components/AuthorLink'
import { GuestBadge } from '@/components/GuestBadge'
import { DisplayType } from '@/components/InlinePost'
import { MemberHovercard } from '@/components/InlinePost/MemberHovercard'
import { useScope } from '@/contexts/scope'
import { longTimestamp } from '@/utils/timestamp'

import { PostLink } from '../Post/PostLink'
import { PostOverflowMenu } from '../Post/PostOverflowMenu'
import { ProjectHovercard } from './ProjectHovercard'

interface InlinePostBylineProps {
  post: Post
  display: DisplayType
  timestamp?: boolean
  overflowMenu?: boolean
  hideProject?: boolean
}

export function InlinePostByline({ post, display, overflowMenu = true, hideProject = false }: InlinePostBylineProps) {
  const { scope } = useScope()

  return (
    <div
      className={cn('col-span-1 col-start-2 flex items-center', {
        'row-span-1 row-start-1': display === 'feed',
        'row-span-2 row-start-1': display !== 'feed'
      })}
    >
      <div className='not-prose flex flex-1 items-center justify-between'>
        <span className='text-tertiary inline-flex flex-wrap gap-1 gap-y-0 text-[15px]'>
          <ConditionalWrap
            condition={post.viewer_is_organization_member}
            wrap={(c) => <MemberHovercard username={post.member.user.username as string}>{c}</MemberHovercard>}
          >
            <ConditionalWrap
              condition={!post.member.user.integration}
              wrap={(c) => (
                <AuthorLink user={post.member.user} className='inline-flex items-center hover:underline'>
                  {c}
                </AuthorLink>
              )}
            >
              <UIText element='span' inherit weight='font-medium' className='text-primary line-clamp-1 text-[15px]'>
                {post.member.user.display_name}
              </UIText>
            </ConditionalWrap>
          </ConditionalWrap>{' '}
          {post.member.role === 'guest' ? (
            <GuestBadge className='h-4.5 translate-y-0.5' />
          ) : post.member.user.integration ? (
            <Badge className='h-4.5 translate-y-0.5'>App</Badge>
          ) : null}
          {!hideProject && (
            <>
              {' in '}
              <ConditionalWrap
                condition={post.viewer_is_organization_member}
                wrap={(c) => <ProjectHovercard projectId={post.project?.id}>{c}</ProjectHovercard>}
              >
                <Link
                  href={`/${scope}/projects/${post.project?.id}`}
                  className='text-primary group/byline-project relative inline-flex items-center gap-1 font-medium'
                >
                  {post.project.accessory && (
                    <UIText element='span' className='translate-y-px font-["emoji"] text-[13px]' inherit>
                      {post.project.accessory}
                    </UIText>
                  )}

                  <UIText
                    element='span'
                    inherit
                    weight='font-medium'
                    className='text-[15px] group-hover/byline-project:underline'
                  >
                    {post.project?.name}
                  </UIText>

                  {post.project.private && (
                    <span className='flex-none'>
                      <LockIcon size={16} />
                    </span>
                  )}
                </Link>
              </ConditionalWrap>
            </>
          )}
          <InlinePostBylineTimestamp post={post} display={display} className='ml-1.5 text-[15px]' />
        </span>
        <span className='flex h-5 items-center gap-1'>
          {overflowMenu && (
            <PostOverflowMenu align='end' type='dropdown' post={post}>
              <Button
                variant='plain'
                iconOnly={<DotsHorizontal />}
                accessibilityLabel='Post actions dropdown'
                className='text-tertiary hover:text-primary'
              />
            </PostOverflowMenu>
          )}
        </span>
      </div>
    </div>
  )
}

function InlinePostBylineTimestamp({
  post,
  display,
  className
}: {
  post: Post
  display: DisplayType
  className?: string
}) {
  const createdAtTitle = longTimestamp(post.published_at || post.created_at)

  return (
    <Tooltip label={createdAtTitle}>
      <span className={cn('text-quaternary hover:text-primary relative flex', className)}>
        <ConditionalWrap
          condition={display !== 'preview'}
          wrap={(c) => (
            <PostLink postId={post.id} className='inline-flex'>
              {c}
            </PostLink>
          )}
        >
          <RelativeTime time={post.published_at || post.created_at} />
        </ConditionalWrap>
      </span>
    </Tooltip>
  )
}
