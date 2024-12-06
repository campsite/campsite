import pluralize from 'pluralize'

import { Post } from '@campsite/types'

export function getPostFallbackTitle(post: Post) {
  if (post.attachments.length) return `${post.attachments.length} ${pluralize('attachment', post.attachments.length)}`
  if (post.unfurled_link) return `Shared a link`
  if (post.poll) return `Created a poll`
  return 'Untitled post'
}
