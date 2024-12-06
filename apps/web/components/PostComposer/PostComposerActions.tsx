import { memo } from 'react'
import { useAtomValue } from 'jotai'
import { useFormContext } from 'react-hook-form'

import { Button } from '@campsite/ui'

import {
  getSaveDraftButtonId,
  getSubmitButtonId,
  isDraftType,
  postComposerStateAtom,
  PostComposerType
} from '@/components/PostComposer/utils'

import { PostSchema } from '../Post/schema'

interface PostComposerActionsProps {
  isUploadingAttachments?: boolean
  hasPostableContent?: boolean
  isPollEmpty?: boolean
}

export const PostComposerActions = memo(function PostComposerActions({
  isUploadingAttachments,
  hasPostableContent,
  isPollEmpty
}: PostComposerActionsProps) {
  const methods = useFormContext<PostSchema>()
  const isSubmitting = methods.formState.isSubmitting
  const postComposerState = useAtomValue(postComposerStateAtom)

  const disabled = isUploadingAttachments || !hasPostableContent || isPollEmpty || isSubmitting

  const tooltipOverride = (() => {
    if (isUploadingAttachments) {
      return 'Uploading attachments...'
    } else if (!hasPostableContent) {
      return 'Post content is empty'
    } else if (isPollEmpty) {
      return 'Poll is missing options'
    } else if (isSubmitting) {
      return 'Posting...'
    } else {
      return undefined
    }
  })()

  /**
   * ## Create Post
   * - Save as draft: create post w/ draft: true
   * - Post: create post
   *
   * ## Edit Draft Post
   * - Save draft: update post
   * - Publish: update post and create publication
   *
   * ## Editing Post
   * - Save: update post
   */

  const submitButtonId = getSubmitButtonId(postComposerState?.type)
  const saveDraftButtonId = getSaveDraftButtonId(postComposerState?.type)

  return (
    <div className='flex flex-1 flex-row items-center justify-end gap-3 sm:gap-2'>
      {postComposerState?.type === PostComposerType.EditPost && (
        <Button
          disabled={disabled}
          id={submitButtonId}
          type='submit'
          variant='primary'
          tooltip={tooltipOverride ?? 'Save changes'}
          tooltipShortcut={disabled ? undefined : 'mod+enter'}
        >
          Save
        </Button>
      )}

      {postComposerState?.type === PostComposerType.EditDraftPost && (
        <>
          <Button disabled={disabled} id={saveDraftButtonId} type='submit' variant='plain'>
            Save draft
          </Button>
          <Button
            disabled={disabled}
            id={submitButtonId}
            type='submit'
            variant='primary'
            tooltip={tooltipOverride ?? 'Post draft'}
            tooltipShortcut={disabled ? undefined : 'mod+enter'}
          >
            Post
          </Button>
        </>
      )}

      {isDraftType(postComposerState?.type) && (
        <>
          <Button disabled={disabled} id={saveDraftButtonId} type='submit' variant='plain'>
            Save draft
          </Button>
          <Button
            disabled={disabled}
            id={submitButtonId}
            type='submit'
            variant='primary'
            tooltip={tooltipOverride ?? 'Create post'}
            tooltipShortcut={disabled ? undefined : 'mod+enter'}
          >
            Post
          </Button>
        </>
      )}

      {postComposerState?.type === PostComposerType.DraftFromPost && (
        <Button
          disabled={disabled}
          id={submitButtonId}
          type='submit'
          variant='primary'
          tooltip={tooltipOverride ?? 'Create new version'}
        >
          Create new version
        </Button>
      )}
    </div>
  )
})
