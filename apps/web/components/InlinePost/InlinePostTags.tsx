import { Post, Tag } from '@campsite/types'
import { Link } from '@campsite/ui'
import { cn, ConditionalWrap } from '@campsite/ui/src/utils'

import { useScope } from '@/contexts/scope'

// ----------------------------------------------------------------------------

function TagPill({ post, tag }: { post: Post; tag: Tag }) {
  const { scope } = useScope()

  return (
    <ConditionalWrap
      condition={post.viewer_is_organization_member}
      wrap={(children) => <Link href={`/${scope}/tags/${tag.name}`}>{children}</Link>}
    >
      <div
        className={cn('text-quaternary flex items-center gap-0.5 text-[15px] text-sm', {
          'hover:text-primary': post.viewer_is_organization_member
        })}
      >
        <span className='opacity-60 dark:opacity-80'>#</span>
        <span>{tag.name}</span>
      </div>
    </ConditionalWrap>
  )
}

// ----------------------------------------------------------------------------

interface InlinePostTagsProps {
  post: Post
}

export function InlinePostTags(props: InlinePostTagsProps) {
  const { post } = props
  const { tags } = post

  if (tags.length === 0) return null

  return (
    <div className='flex flex-wrap gap-x-2.5 gap-y-2'>
      {tags.map((tag) => (
        <TagPill key={tag.name} post={post} tag={tag} />
      ))}
    </div>
  )
}
