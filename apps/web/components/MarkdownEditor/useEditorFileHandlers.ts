import { ClipboardEvent, DragEvent, useCallback, useMemo, useState } from 'react'
import { Editor as TTEditor } from '@tiptap/core'
import { isMacOs } from 'react-device-detect'

import { useUploadNoteAttachments } from '../Post/Notes/Attachments/useUploadAttachments'

export interface DropProps {
  dataTransfer: DataTransfer | null
  clientX: number
  clientY: number
  preventDefault: () => void
  stopPropagation: () => void
}

interface FileDropProps {
  enabled?: boolean
  editor: TTEditor | null
  upload: ReturnType<typeof useUploadNoteAttachments>
}

export function useEditorFileHandlers({ editor, enabled = true, upload }: FileDropProps) {
  const [tailDropcursorVisible, setTailDropcursorVisible] = useState(false)

  const handleDrop = useCallback(
    (editor: TTEditor, props: DropProps) => {
      if (!editor) return false

      if (props.dataTransfer && props.dataTransfer.files && props.dataTransfer.files[0]) {
        props.preventDefault()
        props.stopPropagation()

        const coordinates = editor.view.posAtCoords({
          left: props.clientX,
          top: props.clientY
        })

        upload({
          files: Array.from(props.dataTransfer.files),
          editor,
          pos: coordinates?.pos ?? 'end'
        })

        return true
      }
      return false
    },
    [upload]
  )

  const imperativeHandlers = useMemo(
    () => ({
      handleDrop: (event: DragEvent<HTMLDivElement>) => {
        if (!editor) return
        handleDrop(editor, event)
        setTailDropcursorVisible(false)
      },
      handleDragOver: (isOver: boolean, event: DragEvent<HTMLDivElement>) => {
        // check that the event is inside the editor.view.dom
        setTailDropcursorVisible(
          // disable if the event is over the element
          isOver &&
            // do not show if there are no files
            !!event.dataTransfer?.types.includes('Files') &&
            // if the editor contains the point, let the dropcursor plugin show the cursor
            !editor?.view.dom.contains(event.target as Node)
        )
      }
    }),
    [editor, handleDrop]
  )

  const onDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      if (!editor) return
      if (!enabled) return

      // if dragging and holding the "copy" modifier, bail
      // mirroring internal prosemirror logic for calucluating "moving"
      // https://github.com/ProseMirror/prosemirror-view/blob/312660cd965a9ad4e50d1d6d67eefe6a50bc7371/src/input.ts#L712-L713
      if (editor.view.dragging && !(isMacOs ? event.altKey : event.ctrlKey)) return

      handleDrop(editor, event)
    },
    [editor, enabled, handleDrop]
  )

  const onPaste = useCallback(
    (event: ClipboardEvent<HTMLDivElement>) => {
      if (!editor) return
      if (!enabled) return

      if (event.clipboardData && event.clipboardData.files && event.clipboardData.files[0]) {
        event.preventDefault()
        event.stopPropagation()

        upload({ files: Array.from(event.clipboardData.files), editor })
      }
    },
    [editor, enabled, upload]
  )

  const uploadAndAppendAttachments = useCallback(
    async (files: File[]) => {
      if (!editor || !enabled) return

      // inserting at the end because the UX for inserting a new line above an attachment at the start of a doc
      // is still a little clunky. eventually we probably just want to insert the attachment wherever your cursor is.
      upload({ files, editor, pos: 'end' })
    },
    [editor, enabled, upload]
  )

  return { onDrop, onPaste, imperativeHandlers, tailDropcursorVisible, uploadAndAppendAttachments }
}
