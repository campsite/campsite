import { ClipboardEvent, useMemo, useRef } from 'react'
import { focusManager } from '@tanstack/react-query'
import { FileRejection, useDropzone } from 'react-dropzone'

import { filesFromClipboardData } from '@/utils/filesFromClipboardData'

interface Props {
  enabled?: boolean
  upload?: (files: File[]) => Promise<any>
}

/**
 * Returns utilities for uploading files via paste or drag+drop.
 * - Returns a `dropzone` object for use with the `useDropzone` hook
 * - Returns a `onPaste` function that handles pasting files into the editor
 */
export function useUploadHelpers({ enabled = true, upload }: Props) {
  // track upload fn in a ref to ignore fn stability
  const uploadRef = useRef(upload)

  uploadRef.current = upload

  const { onFileDialogOpen, onFileDialogClosed, onPaste, onDrop, onUpload } = useMemo(() => {
    return {
      onFileDialogOpen: () => {
        if (!enabled) return

        // toggle the React Query focus manager when selecting files so that we do not trigger refetch on close
        focusManager.setFocused(false)
      },
      onFileDialogClosed: () => {
        if (!enabled) return

        focusManager.setFocused(undefined)
      },
      onPaste: (event: ClipboardEvent<HTMLElement>) => {
        const files = filesFromClipboardData(event)

        if (files.length && uploadRef.current) {
          event.stopPropagation()
          uploadRef.current(files)
        }
      },
      onDrop: (acceptedFiles: File[], _fileRejections: FileRejection[]) => {
        onFileDialogClosed()

        if (uploadRef.current) {
          uploadRef.current(acceptedFiles)
        }
      },
      onUpload: (files: File[]) => {
        if (uploadRef.current) {
          uploadRef.current(files)
        }
      }
    }
  }, [enabled])

  const dropzone = useDropzone({
    onDrop,
    noDragEventsBubbling: true,
    onFileDialogOpen,
    onFileDialogCancel: onFileDialogClosed,
    noClick: true,
    noKeyboard: true,
    multiple: true,
    useFsAccessApi: false,
    disabled: !enabled
  })

  return { dropzone, onPaste, onUpload }
}
