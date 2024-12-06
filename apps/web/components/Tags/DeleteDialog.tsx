import { useCallback } from 'react'
import { useRouter } from 'next/router'
import pluralize from 'pluralize'

import { Tag } from '@campsite/types'
import { Button } from '@campsite/ui'
import * as Dialog from '@campsite/ui/src/Dialog'

import { useScope } from '@/contexts/scope'
import { useDeleteTag } from '@/hooks/useDeleteTag'

interface Props {
  tag: Tag
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteTagDialog({ tag, open, onOpenChange }: Props) {
  const router = useRouter()
  const { scope } = useScope()
  const deleteTagMutation = useDeleteTag()
  const isViewingTag = !!router.query.tagName

  const handleCleanup = useCallback(() => {
    onOpenChange(false)

    if (isViewingTag) {
      return router.push(`/${scope}/tags`)
    }
  }, [scope, isViewingTag, router, onOpenChange])

  const isDisabled = deleteTagMutation.isPending

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange} size='sm'>
      <Dialog.Header>
        <Dialog.Title>Delete tag</Dialog.Title>
        <Dialog.Description>
          {tag.posts_count && tag.posts_count > 0
            ? `There ${tag.posts_count === 1 ? 'is' : 'are'} ${tag.posts_count} ${pluralize(
                'post',
                tag.posts_count
              )} using this tag. Are you sure?`
            : 'Are you sure you want to delete this tag?'}
        </Dialog.Description>
      </Dialog.Header>

      <Dialog.Footer>
        <Dialog.TrailingActions>
          <Button variant='flat' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant='destructive'
            onClick={() =>
              deleteTagMutation.mutate(tag.name, {
                onSuccess: () => handleCleanup()
              })
            }
            disabled={isDisabled}
            autoFocus
          >
            Delete
          </Button>
        </Dialog.TrailingActions>
      </Dialog.Footer>
    </Dialog.Root>
  )
}
