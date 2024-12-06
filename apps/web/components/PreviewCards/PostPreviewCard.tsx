import { cn } from '@campsite/ui'

import { InlinePostActor } from '@/components/InlinePost/InlinePostActor'
import { useGetPost } from '@/hooks/useGetPost'

import { GroupedAttachments } from '../GroupedAttachments'
import { InlinePostContentGrid, InlinePostGrid } from '../InlinePost'
import { InlinePostByline } from '../InlinePost/InlinePostByline'
import { InlinePostContainer } from '../InlinePost/InlinePostContainer'
import { InlinePostContent } from '../InlinePost/InlinePostContent'
import { InlinePostEngagements } from '../InlinePost/InlinePostEngagements'
import { InlinePostPoll } from '../InlinePost/InlinePostPoll'
import { InlinePostTags } from '../InlinePost/InlinePostTags'
import { InlinePostTitle } from '../InlinePost/InlinePostTitle'
import { InlinePostVersionStatus } from '../InlinePost/InlinePostVersionStatus'
import { InlinePostTombstone } from '../InlinePost/Tombstone'

interface PostPreviewCardProps {
  className?: string
  postId: string
}

export function PostPreviewCard({ className, postId }: PostPreviewCardProps) {
  const display = 'preview'
  const { data: post, isError } = useGetPost({ postId })

  if (isError) {
    return <InlinePostTombstone />
  }

  if (!post) {
    return (
      <div
        className={cn(
          'bg-primary dark:bg-secondary relative min-h-24 w-full overflow-hidden rounded-lg border',
          className
        )}
      />
    )
  }

  return (
    <InlinePostContainer
      postId={postId}
      display={display}
      className={cn('border-primary-opaque max-w-lg flex-1 rounded-lg border px-3 py-2.5', className)}
      interactive={false}
    >
      <InlinePostVersionStatus display={display} post={post} />

      <InlinePostGrid display={display}>
        <InlinePostActor display={display} post={post} />
        <InlinePostByline overflowMenu={false} display={display} post={post} />

        <InlinePostContentGrid display={display}>
          <InlinePostTitle post={post} display={display} />
          <InlinePostContent display={display} post={post} />
          <InlinePostPoll post={post} />
          <GroupedAttachments
            postId={post.id}
            content={post.description_html}
            truncatedContent={post.truncated_description_html}
            attachments={post.attachments}
            display={display}
            autoPlayVideo={false}
          />

          <InlinePostTags post={post} />

          <InlinePostEngagements post={post} display={display} />
        </InlinePostContentGrid>
      </InlinePostGrid>
    </InlinePostContainer>
  )
}
