import { Comment } from '@campsite/types'

import { FollowUpDropdown } from '@/components/FollowUp'
import { useCreateCommentFollowUp } from '@/hooks/useCreateCommentFollowUp'
import { useDeleteCommentFollowUp } from '@/hooks/useDeleteCommentFollowUp'

interface CommentFollowUpDropdownProps extends React.PropsWithChildren {
  comment: Comment
  align?: 'start' | 'center' | 'end'
}

export function CommentFollowUpDropdown({ children, comment, align }: CommentFollowUpDropdownProps) {
  const createFollowUp = useCreateCommentFollowUp()
  const deleteFollowUp = useDeleteCommentFollowUp()

  if (!comment.viewer_can_follow_up) return null

  return (
    <FollowUpDropdown
      align={align}
      followUps={comment.follow_ups}
      onCreate={({ show_at }) => createFollowUp.mutate({ commentId: comment.id, show_at })}
      onDelete={({ id }) => deleteFollowUp.mutate({ commentId: comment.id, id })}
    >
      {children}
    </FollowUpDropdown>
  )
}
