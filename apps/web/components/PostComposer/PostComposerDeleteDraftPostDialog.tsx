import { DeleteDraftDialog } from '@/components/Drafts/DeleteDraftDialog'
import { usePostComposerIsEditingPost } from '@/components/PostComposer/hooks/usePostComposerIsEditingPost'

interface PostComposerDeleteDraftPostDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export const PostComposerDeleteDraftPostDialog = ({
  open,
  onOpenChange,
  onSuccess
}: PostComposerDeleteDraftPostDialogProps) => {
  const { initialPost } = usePostComposerIsEditingPost()

  return <DeleteDraftDialog post={initialPost} open={open} onOpenChange={onOpenChange} onSuccess={onSuccess} />
}
