import { Post } from '@campsite/types'
import * as Dialog from '@campsite/ui/src/Dialog'

import { PostShareControls } from '@/components/Post/PostShareControls'

interface PostShareDialogProps {
  post: Post
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}

export function PostShareDialog({ post, isOpen, setIsOpen }: PostShareDialogProps) {
  return (
    <Dialog.Root size='base' open={isOpen} onOpenChange={setIsOpen} disableDescribedBy>
      <Dialog.Header>
        <Dialog.Title>Share post</Dialog.Title>
      </Dialog.Header>
      <Dialog.Content className='-mt-4 p-0'>
        <PostShareControls post={post} isOpen={isOpen} source='dialog' />
      </Dialog.Content>
    </Dialog.Root>
  )
}
