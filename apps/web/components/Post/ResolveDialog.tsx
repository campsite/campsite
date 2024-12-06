import { KeyboardEvent, useRef } from 'react'

import { Comment } from '@campsite/types/generated'
import { Avatar, Button, isMetaEnter, LoadingSpinner, UIText, WarningTriangleIcon } from '@campsite/ui'
import * as Dialog from '@campsite/ui/src/Dialog'

import { GeneratedContentFeedback } from '@/components/GeneratedContentFeedback'
import { HTMLRenderer } from '@/components/HTMLRenderer'
import { useGetGeneratedResolution } from '@/hooks/useGetGeneratedResolution'
import { useResolvePost } from '@/hooks/useResolvePost'

import MarkdownEditor, { MarkdownEditorRef } from '../MarkdownEditor'

interface Props {
  postId: string
  comment?: Comment
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ResolveDialog({ postId, comment, open, onOpenChange }: Props) {
  const resolve = useResolvePost()
  const editorRef = useRef<MarkdownEditorRef>(null)
  const getGeneratedResolution = useGetGeneratedResolution({ postId, enabled: open, commentId: comment?.id })

  function handleResolve() {
    resolve.mutate(
      { postId, resolve_html: editorRef.current?.getHTML() ?? null, comment_id: comment?.id ?? null },
      {
        onSuccess: () => {
          onOpenChange(false)
        }
      }
    )
  }

  function handleCommandEnter(event: KeyboardEvent) {
    if (isMetaEnter(event)) {
      handleResolve()
      event.preventDefault()
      event.stopPropagation()
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange} size='lg' align='top'>
      <Dialog.Header>
        <Dialog.Title>Resolve post</Dialog.Title>
        <Dialog.Description className='space-y-2'>Let your team know why this post is resolved.</Dialog.Description>
      </Dialog.Header>

      <Dialog.Content onKeyDownCapture={handleCommandEnter}>
        {getGeneratedResolution.data?.status !== 'pending' && !getGeneratedResolution.isLoading ? (
          <MarkdownEditor
            ref={editorRef}
            containerClasses='border p-2 rounded-lg'
            placeholder='Add a reason (optional)'
            minHeight='80px'
            content={getGeneratedResolution.data?.html ?? undefined}
            autoFocus='end'
            disableMentions
            disableSlashCommand
          />
        ) : (
          <div className='text-tertiary flex items-center space-x-2 text-xs'>
            <LoadingSpinner />
            <UIText inherit>Generating resolution...</UIText>
          </div>
        )}
        {(getGeneratedResolution.data?.status === 'failed' || getGeneratedResolution.isError) && (
          <div className='text-tertiary flex items-center space-x-2 pt-3 text-xs text-red-500'>
            <WarningTriangleIcon />
            <UIText inherit>A resolution cannot be generated.</UIText>
          </div>
        )}
        {comment && (
          <div className='bg-tertiary text-secondary mt-4 flex flex-col space-y-2 rounded-lg p-3'>
            <div className='flex items-center space-x-1.5'>
              <Avatar
                deactivated={comment.member.deactivated}
                name={comment.member.user.display_name}
                urls={comment.member.user.avatar_urls}
                size='xs'
                rounded={comment.member.user.integration ? 'rounded' : 'rounded-full'}
              />
              <UIText element='span' inherit className='break-anywhere line-clamp-1'>
                {comment.member.user.display_name} commented
              </UIText>
            </div>
            {comment.body_html && (
              <HTMLRenderer
                text={comment.body_html}
                className='prose text-secondary line-clamp-3 w-full max-w-full text-sm focus:outline-none'
              />
            )}
          </div>
        )}
      </Dialog.Content>

      <Dialog.Footer>
        <Dialog.LeadingActions>
          {!!getGeneratedResolution.data?.response_id && (
            <GeneratedContentFeedback responseId={getGeneratedResolution.data?.response_id} feature='post_resolution' />
          )}
        </Dialog.LeadingActions>
        <Dialog.TrailingActions>
          <Button variant='flat' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant='primary'
            onClick={handleResolve}
            disabled={resolve.isPending}
            loading={resolve.isPending}
            autoFocus
          >
            Resolve
          </Button>
        </Dialog.TrailingActions>
      </Dialog.Footer>
    </Dialog.Root>
  )
}
