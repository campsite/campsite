import { Post } from '@campsite/types'
import { Link, RefreshIcon, UIText } from '@campsite/ui'
import { cn } from '@campsite/ui/src/utils'

import { DisplayType } from '@/components/InlinePost'
import { useScope } from '@/contexts/scope'

interface InlinePostVersionStatusProps {
  post: Post
  display: DisplayType
}

export function InlinePostVersionStatus({ post, display }: InlinePostVersionStatusProps) {
  const { scope } = useScope()
  const hasVersions = post.has_iterations || post.has_parent

  if (!hasVersions) return null

  let width = 'w-[40px]'

  if (display === 'preview') width = 'w-[24px]'
  if (display === 'feed-compact') width = 'w-fit'

  return (
    <Link
      href={`/${scope}/posts/${post.id}/versions`}
      className={cn(
        'not-prose text-quaternary hover:text-primary inline-flex items-center gap-3 self-start pb-1 focus:ring-0',
        display == 'feed-compact' && 'mr-1 pt-[3px]'
      )}
    >
      <span className={cn('flex justify-end', width)}>
        <RefreshIcon className='-mr-1 text-green-500' />
      </span>

      <UIText element='span' inherit className='font-mono text-[15px]'>{`v${post.version}`}</UIText>
    </Link>
  )
}
