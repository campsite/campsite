import { Avatar, cn, EyeHideIcon, Link, RelativeTime, UIText } from '@campsite/ui'

import { CommentRenderer } from '@/components/Comments/CommentRenderer'
import { useGetComment } from '@/hooks/useGetComment'

interface Props {
  className?: string
  commentId: string
}

export function CommentPreviewCard({ className, commentId }: Props) {
  const { data: comment, isError } = useGetComment(commentId)

  if (isError) {
    return (
      <div className='text-tertiary bg-secondary flex flex-col items-start justify-center gap-3 rounded-lg border p-4 lg:flex-row lg:items-center'>
        <EyeHideIcon className='flex-none' size={24} />
        <UIText inherit>This comment cannot be found — it may have have moved or been deleted</UIText>
      </div>
    )
  }

  if (!comment) {
    return (
      <div
        className={cn(
          'bg-primary dark:bg-secondary relative min-h-24 w-full overflow-hidden rounded-lg border',
          className
        )}
      ></div>
    )
  }

  return (
    <div className='bg-elevated min-h-22 relative flex w-full flex-col gap-2 overflow-hidden rounded-lg border p-3'>
      <Link href={comment.url} className='absolute inset-0 z-0' />

      <span className='text-tertiary not-prose flex items-center gap-1.5'>
        <Avatar
          deactivated={comment.member.deactivated}
          name={comment.member.user.display_name}
          urls={comment.member.user.avatar_urls}
          size='xs'
          rounded={comment.member.user.integration ? 'rounded' : 'rounded-full'}
        />
        <UIText element='span' primary className='break-anywhere text-tertiary line-clamp-1'>
          <span>{comment.member.user.display_name}</span>
          {' commented '}
          <RelativeTime time={comment.created_at} />
        </UIText>
      </span>

      <CommentRenderer comment={comment} />
    </div>
  )
}
