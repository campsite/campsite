import {
  DragEvent,
  forwardRef,
  KeyboardEvent,
  memo,
  MouseEvent,
  useEffect,
  useImperativeHandle,
  useRef,
  useState
} from 'react'
import { HocuspocusProvider } from '@hocuspocus/provider'
import { Editor as TTEditor } from '@tiptap/core'
import { EditorContent } from '@tiptap/react'
import { useSetAtom } from 'jotai'

import { ActiveEditorComment, BlurAtTopOptions, focusAtStartWithNewline } from '@campsite/editor'
import { Note } from '@campsite/types/generated'
import { LayeredHotkeys } from '@campsite/ui/DismissibleLayer'
import { cn } from '@campsite/ui/src/utils'

import { AttachmentLightbox } from '@/components/AttachmentLightbox'
import { MentionList } from '@/components/MarkdownEditor/MentionList'
import { ReactionList } from '@/components/MarkdownEditor/ReactionList'
import { ResourceMentionList } from '@/components/MarkdownEditor/ResourceMentionList'
import { ADD_ATTACHMENT_SHORTCUT, SlashCommand } from '@/components/Post/Notes/SlashCommand'
import { activeNoteEditorAtom } from '@/components/Post/Notes/types'
import { useAutoScroll } from '@/hooks/useAutoScroll'

import { CodeBlockLanguagePicker } from '../CodeBlockLanguagePicker'
import { EditorBubbleMenu } from '../EditorBubbleMenu'
import { MentionInteractivity } from '../InlinePost/MemberHovercard'
import { DropProps, useEditorFileHandlers } from '../MarkdownEditor/useEditorFileHandlers'
import { HighlightCommentPopover } from '../NoteComments/HighlightCommentPopover'
import { useUploadNoteAttachments } from '../Post/Notes/Attachments/useUploadAttachments'
import { NoteCommentPreview } from '../Post/Notes/CommentRenderer'
import { useNoteEditor } from '../Post/Notes/useNoteEditor'

interface Props {
  provider?: HocuspocusProvider | null
  note: Note
  editable?: 'all' | 'viewer'
  isSyncError?: boolean
  autofocus?: boolean
  content: string
  onBlurAtTop?: BlurAtTopOptions['onBlur']
  onKeyDown?: (event: KeyboardEvent) => void
}

export interface NoteContentRef {
  focus(pos: 'start' | 'end' | 'restore' | 'start-newline' | MouseEvent): void
  handleDrop(props: DropProps): void
  handleDragOver(isOver: boolean, event: DragEvent): void
  editor: TTEditor | null
}

export const NoteContent = memo(
  forwardRef<NoteContentRef, Props>((props, ref) => {
    const { note, editable = 'viewer', isSyncError = false, autofocus = false, onBlurAtTop, provider, content } = props

    const noteId = note.id
    const [activeComment, setActiveComment] = useState<ActiveEditorComment | null>(null)
    const [hoverComment, setHoverComment] = useState<ActiveEditorComment | null>(null)
    const [openAttachmentId, setOpenAttachmentId] = useState<string | undefined>()

    const canUploadAttachments = editable === 'all'
    const upload = useUploadNoteAttachments({ noteId, enabled: canUploadAttachments })

    const editor = useNoteEditor({
      content,
      autofocus,
      editable: isSyncError ? 'none' : editable,
      onHoverComment: setHoverComment,
      onActiveComment: setActiveComment,
      onOpenAttachment: setOpenAttachmentId,
      onBlurAtTop,
      provider
    })

    const setActiveEditor = useSetAtom(activeNoteEditorAtom)

    useEffect(() => {
      setActiveEditor(editor)
      return () => setActiveEditor(null)
    }, [setActiveEditor, editor])

    const { onDrop, onPaste, imperativeHandlers, tailDropcursorVisible } = useEditorFileHandlers({
      enabled: canUploadAttachments,
      upload,
      editor
    })

    // these functions allow us to call editorRef?.current?.handleDrop() etc. on the parent container
    useImperativeHandle(
      ref,
      () => ({
        focus: (pos) => {
          if (pos === 'start') {
            editor.commands.focus('start')
          } else if (pos === 'start-newline') {
            focusAtStartWithNewline(editor)
          } else if (pos === 'end') {
            editor.commands.focus('end')
          } else if (pos === 'restore') {
            editor.commands.focus()
          } else if ('clientX' in pos && 'clientY' in pos && 'target' in pos) {
            if (editor.view.dom.contains(pos.target as Node)) {
              return
            }

            const { left, right, top } = editor.view.dom.getBoundingClientRect()
            const isRight = pos.clientX > right
            const editorPos = editor.view.posAtCoords({
              left: isRight ? right : left,
              top: pos.clientY
            })

            if (editorPos) {
              const posAdjustment = isRight && editor.view.coordsAtPos(editorPos.pos).left === left ? -1 : 0

              editor.commands.focus(editorPos.pos + posAdjustment)
            } else if (pos.clientY < top) {
              editor.commands.focus('start')
            } else {
              editor.commands.focus('end')
            }
          }
        },
        ...imperativeHandlers,
        editor
      }),
      [editor, imperativeHandlers]
    )

    const containerRef = useRef<HTMLDivElement>(null)

    useAutoScroll({
      ref: containerRef,
      enabled: true
    })

    return (
      <div ref={containerRef} className={cn('relative', { 'opacity-50': isSyncError })}>
        <LayeredHotkeys
          keys={ADD_ATTACHMENT_SHORTCUT}
          callback={() => {
            if (!editor.isFocused) return

            const input = document.createElement('input')

            input.type = 'file'
            input.onchange = async () => {
              if (input.files?.length) {
                upload({
                  files: Array.from(input.files),
                  editor
                })
              }
            }
            input.click()
          }}
          options={{ enableOnContentEditable: true, enableOnFormTags: true }}
        />

        <NoteCommentPreview
          onExpand={() => {
            if (hoverComment) {
              setHoverComment(null)
              setActiveComment(hoverComment)
            }
          }}
          previewComment={activeComment ? null : hoverComment}
          editor={editor}
          noteId={noteId}
        />
        <MentionInteractivity container={containerRef} />
        <CodeBlockLanguagePicker editor={editor} />
        <SlashCommand editor={editor} upload={upload} />
        <MentionList editor={editor} />
        <ResourceMentionList editor={editor} />
        <ReactionList editor={editor} />

        <AttachmentLightbox
          subject={note}
          selectedAttachmentId={openAttachmentId}
          onClose={() => setOpenAttachmentId(undefined)}
          onSelectAttachment={({ id }) => setOpenAttachmentId(id)}
        />

        <HighlightCommentPopover
          activeComment={activeComment}
          editor={editor}
          noteId={noteId}
          onCommentDeactivated={() => setActiveComment(null)}
        />

        {!isSyncError && <EditorBubbleMenu editor={editor} canComment />}

        <EditorContent editor={editor} onKeyDown={props.onKeyDown} onPaste={onPaste} onDrop={onDrop} />
        <div className={cn('mx-auto h-[2px] max-w-[44rem] bg-blue-500', { hidden: !tailDropcursorVisible })} />
      </div>
    )
  })
)

NoteContent.displayName = 'NoteContent'
