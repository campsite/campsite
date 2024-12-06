import { memo } from 'react'

import { Post } from '@campsite/types'
import { cn } from '@campsite/ui/src/utils'

import { GroupedAttachments } from '@/components/GroupedAttachments'
import { InlinePostActor } from '@/components/InlinePost/InlinePostActor'
import { InlinePostContainer } from '@/components/InlinePost/InlinePostContainer'
import { InlinePostEngagements } from '@/components/InlinePost/InlinePostEngagements'
import { InlinePostSocialActions } from '@/components/InlinePost/InlinePostSocialActions'
import { InlinePostTags } from '@/components/InlinePost/InlinePostTags'
import { useLivePostUpdates } from '@/hooks/useLivePostUpdates'

import { RichLinkCard } from '../RichLinkCard'
import { InlinePostByline } from './InlinePostByline'
import { InlinePostContent } from './InlinePostContent'
import { InlinePostPoll } from './InlinePostPoll'
import { InlinePostTitle } from './InlinePostTitle'
import { InlinePostVersionStatus } from './InlinePostVersionStatus'
import { Resolution } from './Resolution'

export type DisplayType = 'feed' | 'feed-compact' | 'page' | 'preview'

interface InlinePostProps {
  post: Post
  display?: DisplayType
  hideProject?: boolean
}

export const InlinePost = memo(function InlinePost({ post, display = 'feed', hideProject }: InlinePostProps) {
  useLivePostUpdates(post)

  return (
    <InlinePostContainer
      postId={post.id}
      display={display}
      className={cn({
        'cursor-pointer': display === 'feed'
      })}
    >
      {display === 'page' && <Resolution post={post} display='page' className='mb-5' />}
      <InlinePostVersionStatus display={display} post={post} />

      <InlinePostGrid display={display}>
        <InlinePostActor post={post} display={display} />
        <InlinePostByline display={display} post={post} overflowMenu={display !== 'page'} hideProject={hideProject} />

        <InlinePostContentGrid display={display}>
          <InlinePostTitle post={post} display={display} />
          {display !== 'page' && <Resolution post={post} display='feed' />}
          <InlinePostContent display={display} post={post} />

          <InlinePostPoll post={post} />
          <GroupedAttachments
            postId={post.id}
            content={post.description_html}
            truncatedContent={post.truncated_description_html}
            attachments={post.attachments}
            display={display}
          />

          {post.unfurled_link && (
            <div className='max-w-lg'>
              <RichLinkCard url={post.unfurled_link} interactive />
            </div>
          )}

          <InlinePostTags post={post} />
          <InlinePostSocialActions post={post} display={display} />
          <InlinePostEngagements post={post} display={display} />
        </InlinePostContentGrid>
      </InlinePostGrid>
    </InlinePostContainer>
  )
})

export function InlinePostContentGrid({ display, children }: { display: DisplayType; children: React.ReactNode }) {
  return (
    <div
      className={cn('flex flex-col gap-3', {
        'col-span-1 col-start-2 row-span-3 row-start-2 border-b pb-6': display === 'feed',
        'col-span-2 col-start-1 row-span-3 row-start-3': display === 'page' || display === 'preview'
      })}
    >
      {children}
    </div>
  )
}

export function InlinePostGrid({ display, children }: { display: DisplayType; children: React.ReactNode }) {
  return (
    <div
      className={cn('grid-rows relative isolate grid', {
        'grid-cols-[52px,minmax(0,1fr)] grid-rows-[minmax(20px,1fr),20px,max-content,max-content]': display === 'feed',
        'grid-cols-[32px,minmax(0,1fr)] grid-rows-[24px,0,max-content,max-content]': display === 'page',
        'grid-cols-[36px,minmax(0,1fr)] grid-rows-[minmax(28px,1fr),0,max-content,max-content]': display === 'preview'
      })}
    >
      {children}
    </div>
  )
}
