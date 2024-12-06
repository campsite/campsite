import { useCallback, useMemo, useRef, useState } from 'react'
import { useMutationState } from '@tanstack/react-query'
import { Editor, getHTMLFromFragment } from '@tiptap/core'

import { ActiveEditorComment } from '@campsite/editor'
import { Comment, Note } from '@campsite/types'
import { Button, CONTAINER_STYLES, Popover, PopoverContent, PopoverElementAnchor, PopoverPortal } from '@campsite/ui'
import * as Dialog from '@campsite/ui/src/Dialog'
import { cn } from '@campsite/ui/src/utils'

import { NoteCommentComposer } from '@/components/Comments/NoteCommentComposer'
import { useScope } from '@/contexts/scope'
import { useGetComment } from '@/hooks/useGetComment'
import { useGetNote } from '@/hooks/useGetNote'
import { apiClient } from '@/utils/queryClient'
import { scrollImmediateScrollableNodeToBottom } from '@/utils/scroll'

import { cleanFragmentForHighlight, commentElement } from '../Post/Notes/CommentRenderer'
import { CommentComponent } from './Comment'

const deleteCommentsById = apiClient.organizations.deleteCommentsById()

interface Props {
  editor: Editor | null
  noteId: string
  activeComment: ActiveEditorComment | null
  onCommentDeactivated?: () => void
}

export function HighlightCommentPopover(props: Props) {
  const { editor, noteId, activeComment, onCommentDeactivated } = props

  const isNewComment = !!activeComment?.newCommentRange
  const { data: note } = useGetNote({ id: noteId })
  const commentContainerRef = useRef<HTMLDivElement>(null)
  const noteHighlight = useMemo(() => {
    if (!editor || !activeComment || !activeComment.newCommentRange) return

    const slice = editor.state.doc.slice(activeComment.newCommentRange.from, activeComment.newCommentRange.to)
    const cleanedContent = cleanFragmentForHighlight(slice.content, editor.schema)

    return getHTMLFromFragment(cleanedContent, editor.schema)
  }, [editor, activeComment])

  const [dismissDialogOpen, setDismissDialogOpen] = useState(false)
  const [isEmpty, setIsEmpty] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const onServerCreate = useCallback(
    (data: Comment) => {
      if (!isNewComment) {
        // wait one render tick so that the optimistic comment is rendered first
        queueMicrotask(() => {
          scrollImmediateScrollableNodeToBottom(commentContainerRef.current)
          setSubmitting(false)
        })
      } else {
        if (activeComment?.newCommentRange) {
          editor?.chain().unsetNewComment().setComment(data.id, activeComment.newCommentRange).run()
          onCommentDeactivated?.()
        }
        setSubmitting(false)
      }
    },
    [activeComment, editor, isNewComment, onCommentDeactivated]
  )

  // if this comment is being deleted, hide the popover
  const { scope } = useScope()
  const isDeletingComment = useMutationState({
    filters: { mutationKey: deleteCommentsById.requestKey(`${scope}`, `${activeComment?.id}`) },
    select: ({ state }) => state.status === 'pending' || state.status === 'success'
  }).at(0)

  if (!note || !editor) return null

  const hideOptimisticNewComment = isNewComment && submitting
  const dismiss = () => {
    editor.commands.unsetNewComment()
    onCommentDeactivated?.()
  }
  const elementAnchor = activeComment && commentElement(activeComment.id, isNewComment, editor?.view.dom)
  const open = !!activeComment && !hideOptimisticNewComment && !!elementAnchor && !isDeletingComment

  return (
    <>
      <Dialog.Root
        open={dismissDialogOpen}
        onOpenChange={setDismissDialogOpen}
        size='lg'
        visuallyHiddenTitle='Discard comment'
      >
        <Dialog.Header>
          <Dialog.Description>Are you sure you want to discard your comment?</Dialog.Description>
        </Dialog.Header>

        <Dialog.Footer>
          <Dialog.TrailingActions>
            <Button onClick={() => setDismissDialogOpen(false)}>Cancel</Button>
            <Button
              variant='destructive'
              onClick={() => {
                dismiss()
                setDismissDialogOpen(false)
              }}
              autoFocus
            >
              Discard
            </Button>
          </Dialog.TrailingActions>
        </Dialog.Footer>
      </Dialog.Root>

      <Popover
        open={open}
        onOpenChange={(open) => {
          if (!open) {
            if (isEmpty) {
              dismiss()
            } else {
              setDismissDialogOpen(true)
            }
          }
        }}
        modal
      >
        <PopoverElementAnchor element={elementAnchor} asChild />
        <PopoverPortal>
          <PopoverContent
            className={cn('scrollable min-w-[365px] max-w-[365px]', CONTAINER_STYLES.base)}
            avoidCollisions
            side='top'
            align='center'
            onCloseAutoFocus={(evt) => {
              evt.preventDefault()
              editor.chain().focus().run()
            }}
            sideOffset={8}
            addDismissibleLayer
          >
            {open && (
              <div
                key={activeComment.id}
                className={cn(
                  'bg-elevated flex w-full flex-col rounded-xl shadow-lg shadow-black/20 ring-1 ring-black/[0.04] dark:shadow-[inset_0px_1px_0px_rgba(255,255,255,0.04),_0px_2px_12px_rgba(0,0,0,0.4),_0px_0px_0px_1px_rgba(0,0,0,0.8)] dark:ring-white/[0.02]',
                  'origin-[--radix-popover-content-transform-origin]'
                )}
              >
                <div ref={commentContainerRef} className='max-h-[400px] w-full overflow-y-auto'>
                  {!isNewComment && <FetchingCommentComponent commentId={activeComment.id} note={note} />}
                </div>

                <div
                  className={cn({
                    'border-t': !isNewComment
                  })}
                >
                  <NoteCommentComposer
                    autoFocus={isNewComment}
                    noteId={noteId}
                    noteHighlight={noteHighlight}
                    onCreated={onServerCreate}
                    onSubmitting={() => setSubmitting(true)}
                    onEmptyChange={setIsEmpty}
                    replyingToCommentId={!isNewComment ? activeComment?.id : undefined}
                    display='inline'
                    placeholder={isNewComment ? 'Write a comment...' : 'Write a reply...'}
                  />
                </div>
              </div>
            )}
          </PopoverContent>
        </PopoverPortal>
      </Popover>
    </>
  )
}

function FetchingCommentComponent({ commentId, note }: { commentId: string; note: Note }) {
  const { data: comment } = useGetComment(commentId)

  return comment && <CommentComponent comment={comment} note={note} highlightPopover />
}
