import { Post } from '@campsite/types'

import { HomeFollowUpDialog } from '@/components/Home/HomeFollowUpDialog'

interface PostFollowUpDialogProps {
  post: Post
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PostFollowUpDialog({ post, open, onOpenChange }: PostFollowUpDialogProps) {
  return (
    <HomeFollowUpDialog
      title={post.title}
      id={post.id}
      type={post.type_name}
      viewerFollowUp={post.follow_ups.find((f) => f.belongs_to_viewer)}
      open={open}
      onOpenChange={onOpenChange}
    />
  )
}
