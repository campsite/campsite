import { useState } from 'react'

import { Post } from '@campsite/types'
import { Button, Checkbox, UIText } from '@campsite/ui'
import * as Dialog from '@campsite/ui/src/Dialog'

import { useDeletePost } from '@/hooks/useDeletePost'

interface Props {
  post: Post
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeletePostDialog({ post, open, onOpenChange }: Props) {
  const [accepted, setAccepted] = useState(false)
  const deletePostMutation = useDeletePost()

  function handleDelete() {
    if (post.has_iterations && !accepted) return

    deletePostMutation.mutate({ post }, { onSuccess: () => onOpenChange(false) })
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange} size='lg'>
      <Dialog.Header>
        <Dialog.Title>Delete post</Dialog.Title>
        <Dialog.Description>
          {post.has_iterations
            ? 'The post you are deleting has newer versions. If you delete this post, all newer versions will be deleted as well. This action cannot be undone.'
            : post.has_parent
              ? 'Are you sure you want to delete this post? Previous versions will not be deleted.'
              : 'Are you sure you want to delete this post? This action cannot be undone.'}
        </Dialog.Description>
      </Dialog.Header>

      {post.has_iterations && (
        <Dialog.Content>
          <label className='flex items-start space-x-3'>
            <Checkbox checked={accepted} onChange={() => setAccepted(!accepted)} />
            <UIText weight='font-medium'>I understand that deleting this post will delete newer versions.</UIText>
          </label>
        </Dialog.Content>
      )}

      <Dialog.Footer>
        <Dialog.TrailingActions>
          <Button variant='flat' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant='destructive'
            onClick={handleDelete}
            disabled={deletePostMutation.isPending || (!accepted && post.has_iterations)}
            loading={deletePostMutation.isPending}
            autoFocus
          >
            Delete post
          </Button>
        </Dialog.TrailingActions>
      </Dialog.Footer>
    </Dialog.Root>
  )
}
