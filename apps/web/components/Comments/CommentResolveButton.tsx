import { isMobile } from 'react-device-detect'

import { Comment } from '@campsite/types'
import { Button, ResolveCommentIcon, UnresolveCommentIcon } from '@campsite/ui'

import { useResolveComment } from '@/hooks/useResolveComment'
import { useUnresolveComment } from '@/hooks/useUnresolveComment'

interface Props {
  subjectId: string
  subjectType: 'post' | 'note'
  comment: Comment
}

export function CommentResolveButton({ subjectId, subjectType, comment }: Props) {
  const resolve = useResolveComment()
  const unresolve = useUnresolveComment()

  // disable resolving on mobile
  if (isMobile || !comment.viewer_can_resolve) {
    return null
  }

  if (comment.resolved_at) {
    return (
      <Button
        variant='plain'
        iconOnly={<UnresolveCommentIcon />}
        accessibilityLabel='Reopen comment'
        tooltip={`Resolved by ${comment.resolved_by?.user.display_name}`}
        onClick={() => unresolve.mutate({ commentId: comment.id, subjectId, subjectType })}
      />
    )
  } else {
    return (
      <Button
        variant='plain'
        iconOnly={<ResolveCommentIcon />}
        accessibilityLabel='Resolve comment'
        tooltip='Resolve comment'
        onClick={() => resolve.mutate({ commentId: comment.id, subjectId, subjectType })}
      />
    )
  }
}
