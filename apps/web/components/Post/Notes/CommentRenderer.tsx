import { useMemo } from 'react'
import { Editor } from '@tiptap/core'
import { Fragment, Node as PMNode, Schema } from '@tiptap/pm/model'
import { AnimatePresence, m } from 'framer-motion'

import { ActiveEditorComment } from '@campsite/editor'
import { User } from '@campsite/types'
import {
  ANIMATION_CONSTANTS,
  Popover,
  PopoverContent,
  PopoverElementAnchor,
  PopoverPortal,
  RelativeTime,
  UIText
} from '@campsite/ui'
import { cn } from '@campsite/ui/src/utils'

import { CommentDescription } from '@/components/Comments/CommentDescription'
import { FacePile } from '@/components/FacePile'
import { useGetComment } from '@/hooks/useGetComment'
import { useGetCurrentUser } from '@/hooks/useGetCurrentUser'

export const commentElement = (id: string, isNewComment: boolean = false, dom: HTMLElement | Document = document) => {
  const selector = isNewComment ? `[optimisticId="${id}"]` : `[commentid="${id}"]`

  return dom.querySelector(selector) as HTMLElement | null
}

function cleanNodeForHighlight(node: PMNode, schema: Schema, depth: number) {
  const cleanedContent = cleanFragmentForHighlight(node.content, schema, depth + 1)

  if (depth === 0 && node.type.name === 'listItem') {
    return schema.nodes.paragraph.create({}, cleanedContent)
  }

  const newMarks = node.marks.filter((m) => m.type.name !== 'comment')

  if (node.isText) {
    return schema.text(node.text ?? '', newMarks)
  }
  return schema.node(node.type, node.attrs, cleanedContent, newMarks)
}

export function cleanFragmentForHighlight(fragment: Fragment, schema: Schema, depth: number = 0) {
  const newNodes: PMNode[] = []

  fragment.forEach((node) => newNodes.push(cleanNodeForHighlight(node, schema, depth)))
  return Fragment.fromArray(newNodes)
}

interface NoteCommentPreviewProps {
  previewComment: ActiveEditorComment | null
  editor: Editor | null
  noteId: string
  onExpand: () => void
}

export function NoteCommentPreview({ previewComment, editor, ...props }: NoteCommentPreviewProps) {
  const open = !!previewComment && !!editor

  // wrapping the children enables the preview to animate in/out as previewComment changes
  return (
    <Popover open={open}>
      <AnimatePresence>
        {open && <CommentPreviewPopoverContent previewComment={previewComment} editor={editor} {...props} />}
      </AnimatePresence>
    </Popover>
  )
}

interface CommentPreviewPopoverContentProps {
  previewComment: ActiveEditorComment
  editor: Editor
  noteId: string
  onExpand: () => void
}

function CommentPreviewPopoverContent({ previewComment, editor, noteId, onExpand }: CommentPreviewPopoverContentProps) {
  const { data: comment } = useGetComment(previewComment.id)
  const { data: currentUser } = useGetCurrentUser()
  const uniqueAuthors = useMemo(() => {
    if (!comment) return [{ ...currentUser, type_name: 'user' } as User]

    const set = new Set()

    return [comment.member.user, comment.replies.map((r) => r.member.user)].flat().filter((user) => {
      if (set.has(user.id)) {
        return false
      }
      set.add(user.id)
      return true
    })
  }, [comment, currentUser])

  if (!comment) return null

  return (
    <>
      <PopoverElementAnchor
        element={previewComment && commentElement(previewComment.id, false, editor?.view.dom)}
        asChild
      />
      <PopoverPortal forceMount>
        <PopoverContent
          asChild
          avoidCollisions
          side='top'
          align='center'
          sideOffset={8}
          onOpenAutoFocus={(evt) => evt.preventDefault()}
          onCloseAutoFocus={(evt) => evt.preventDefault()}
        >
          <m.div
            className={cn(
              'dark:bg-elevated relative flex min-w-[32px] max-w-[250px] origin-[--radix-popover-content-transform-origin] gap-2 overflow-hidden rounded-xl bg-white p-1.5 shadow-md ring-1 ring-black/5 transition-shadow hover:shadow-lg dark:shadow-[inset_0px_1px_0px_rgba(255,255,255,0.10),_0px_2px_4px_rgba(0,0,0,0.5),_0px_0px_0px_1px_rgba(0,0,0,1)]',
              {
                'items-center': !comment.body_html,
                'items-start': comment.body_html
              }
            )}
            onClick={onExpand}
            {...{
              ...ANIMATION_CONSTANTS,
              animate: {
                ...ANIMATION_CONSTANTS.animate,
                transition: {
                  ...ANIMATION_CONSTANTS.animate.transition,
                  delay: 0.01
                }
              }
            }}
          >
            <FacePile size='sm' limit={2} users={uniqueAuthors} showTooltip={false} />
            <div className='flex flex-col'>
              <div className='flex gap-1.5'>
                <UIText primary weight='font-medium' size='text-sm'>
                  {comment.member.user.display_name}
                </UIText>
                <UIText tertiary size='text-sm'>
                  <RelativeTime time={comment.created_at} />
                </UIText>
              </div>
              {comment.body_html && (
                <div className='line-clamp-1 opacity-60'>
                  <CommentDescription
                    subjectId={noteId}
                    subjectType='Note'
                    comment={comment}
                    isEditing={false}
                    isReply={false}
                    setIsEditing={() => {
                      return
                    }}
                  />
                </div>
              )}
            </div>
          </m.div>
        </PopoverContent>
      </PopoverPortal>
    </>
  )
}
