import { Post } from '@campsite/types'

import { useCreatePostFollowUp } from '@/hooks/useCreatePostFollowUp'
import { useDeletePostFollowUp } from '@/hooks/useDeletePostFollowUp'

import { FollowUpDropdown, FollowUpDropdownRef } from '../FollowUp'

interface InlinePostFollowUpDropdownProps extends React.PropsWithChildren {
  post: Post
  followUpRef?: React.RefObject<FollowUpDropdownRef>
}

export function InlinePostFollowUpDropdown({ children, post, followUpRef }: InlinePostFollowUpDropdownProps) {
  const createFollowUp = useCreatePostFollowUp()
  const deleteFollowUp = useDeletePostFollowUp()

  return (
    <FollowUpDropdown
      ref={followUpRef}
      followUps={post.follow_ups}
      onCreate={({ show_at }) => createFollowUp.mutate({ postId: post.id, show_at })}
      onDelete={({ id }) => deleteFollowUp.mutate({ postId: post.id, id })}
      align='end'
    >
      {children}
    </FollowUpDropdown>
  )
}
