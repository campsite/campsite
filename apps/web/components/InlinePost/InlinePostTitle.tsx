import { Post } from '@campsite/types'
import { UIText } from '@campsite/ui'

import { DisplayType } from '.'

interface InlinePostTitleProps {
  post: Post
  display: DisplayType
}

export function InlinePostTitle({ post, display }: InlinePostTitleProps) {
  if (!post.title) return null

  // noop pre-title posts or posts where the user formatted the title in the description
  // this avoids showing the title twice
  if (post.is_title_from_description) return null

  if (display === 'page') {
    return (
      <UIText
        selectable
        element='h2'
        className='text-primary break-anywhere -mb-2 mt-4 text-[22px] font-bold leading-snug'
      >
        {post.title}
      </UIText>
    )
  }

  if (display === 'preview') {
    return (
      <UIText selectable weight='font-semibold' className='-mb-3 mt-1 leading-snug' size='text-base'>
        {post.title}
      </UIText>
    )
  }

  if (display === 'feed') {
    return (
      <UIText selectable className='text-primary -mb-4 mt-1 text-xl font-semibold leading-snug'>
        {post.title}
      </UIText>
    )
  }

  return null
}
