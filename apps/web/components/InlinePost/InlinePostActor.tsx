import { Post } from '@campsite/types'
import { cn, ConditionalWrap } from '@campsite/ui/src/utils'

import { AuthorLink } from '@/components/AuthorLink'
import { DisplayType } from '@/components/InlinePost'
import { MemberHovercard } from '@/components/InlinePost/MemberHovercard'
import { MemberAvatar } from '@/components/MemberAvatar'

interface InlinePostActorProps {
  post: Post
  display: DisplayType
}

export function InlinePostActor({ post, display }: InlinePostActorProps) {
  return (
    <div
      className={cn('not-prose z-10 col-span-1 col-start-1 row-span-2 row-start-1', {
        'pt-0.5': display === 'preview'
      })}
    >
      <ConditionalWrap
        condition={post.viewer_is_organization_member}
        wrap={(c) => (
          <MemberHovercard username={post.member.user.username as string}>
            <AuthorLink user={post.member.user} className='rounded-full'>
              {c}
            </AuthorLink>
          </MemberHovercard>
        )}
      >
        <MemberAvatar member={post.member} size={display === 'preview' || display === 'page' ? 'sm' : 'lg'} />
      </ConditionalWrap>
    </div>
  )
}
