import { forwardRef, MouseEvent, useCallback, useEffect, useRef, useState } from 'react'
import { isMobile } from 'react-device-detect'
import { useDebouncedCallback } from 'use-debounce'

import { BlurAtTopOptions } from '@campsite/editor/extensions/BlurAtTop'
import { Note } from '@campsite/types'
import { UIText } from '@campsite/ui'
import { cn } from '@campsite/ui/src/utils'

import { EMPTY_HTML } from '@/atoms/markdown'
import { TitleTextField } from '@/components/TitleTextField'
import { useBeforeRouteChange } from '@/hooks/useBeforeRouteChange'
import { useUpdateNote } from '@/hooks/useUpdateNote'
import { apiErrorToast } from '@/utils/apiErrorToast'

import { useEditorSync } from '../Post/Notes/useEditorSync'
import { NoteContent, NoteContentRef } from './NoteContent'
import { useHandleBottomScrollOffset } from './useHandleBottomScrollOffset'
import { useHasConnectionIssue } from './useHasConnectionIssue'

interface Props {
  note: Note
  quickNote?: boolean
}

export function NoteEditor({ note, quickNote }: Props) {
  const editorRef = useRef<NoteContentRef>(null)
  const editorContainerRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLTextAreaElement>(null)
  const reactionsRef = useRef<HTMLDivElement>(null)

  const [provider, syncState, syncError] = useEditorSync({
    resourceId: note.id,
    resourceType: 'Note',
    initialState: note.description_state
  })

  const showConnectionIssues = useHasConnectionIssue(syncState)

  const editable = note.viewer_can_edit ? 'all' : 'viewer'

  const mouseDownInEditorRef = useRef(false)
  const id = `note-editor-${note.id}`
  const onContainerMouseDown = (event: MouseEvent) => {
    mouseDownInEditorRef.current = !!editorRef.current?.editor?.view.dom.contains(event.target as Node)
  }
  const onContainerMouseUp = (event: MouseEvent) => {
    if (mouseDownInEditorRef.current) return

    const isReactionsClick =
      event.target === reactionsRef.current || !!reactionsRef.current?.contains(event.target as Node)
    const isClickInContainer = !!(event.target as HTMLElement).closest(`#${id}`)
    const isClickInTippy = !!(event.target as HTMLElement).closest('[data-tippy-root]')

    if (isClickInContainer && !isReactionsClick && !isClickInTippy) {
      if (titleRef.current && event.clientY < titleRef.current.getBoundingClientRect().bottom) {
        titleRef.current.focus()
      } else if (editorContainerRef.current) {
        const { top, bottom } = editorContainerRef.current.getBoundingClientRect()

        if (event.clientY < top) {
          editorRef.current?.focus('start')
        } else if (event.clientY > bottom) {
          editorRef.current?.focus('end')
        } else {
          editorRef.current?.focus(event)
        }
      }
    }
  }

  const focusTitle: BlurAtTopOptions['onBlur'] = useCallback((pos) => {
    titleRef.current?.focus()
    if (pos === 'end') {
      titleRef.current?.setSelectionRange(titleRef.current.value.length, titleRef.current.value.length)
    }
  }, [])

  const onKeyDownScrollHandler = useHandleBottomScrollOffset({
    editor: editorRef.current?.editor
  })

  const canAutofocus = !!note?.viewer_is_author
  const hasDescription = !!note?.description_html && note?.description_html !== EMPTY_HTML
  const canAutofocusTitle = canAutofocus && !note?.title
  const canAutofocusDescription = canAutofocus && !canAutofocusTitle && !hasDescription

  return (
    <div className='flex w-full flex-1 flex-col'>
      {syncError === 'invalid-schema' ? (
        // 1. Show a banner if there's a schema error and inform the user to refresh to get latest version.
        <ConnectionIssueBanner>
          New update available.{' '}
          <UIText element='span' inherit weight='font-medium'>
            Refresh to edit or comment
          </UIText>
        </ConnectionIssueBanner>
      ) : syncError ? (
        // 2. If there's any other kind of sync error, make sure to always show a banner.
        <ConnectionIssueBanner>
          Connection issues.{' '}
          <UIText element='span' inherit weight='font-medium'>
            Refresh to edit or comment
          </UIText>
        </ConnectionIssueBanner>
      ) : showConnectionIssues && !syncError ? (
        // 3. If there's no sync error, but we are also not connected, show a banner and
        // inform the user that changes are not persisted. This is important as only sync errors
        // will disable the markdown editor.
        <ConnectionIssueBanner>
          Connection issues. Changes cannot be saved.{' '}
          <UIText element='span' inherit weight='font-medium'>
            Refresh to connect
          </UIText>
        </ConnectionIssueBanner>
      ) : null}

      <div
        id={id}
        // pb-[x] is how much space we want to leave between the bottom of the note editor and the viewport as a user types
        className='flex w-full flex-1 cursor-text flex-col gap-4 pb-[10vh]'
        onDragOverCapture={(e) => {
          e.preventDefault()
          editorRef?.current?.handleDragOver(true, e)
        }}
        onDragLeaveCapture={(e) => editorRef?.current?.handleDragOver(false, e)}
        onDragExitCapture={(e) => editorRef?.current?.handleDragOver(false, e)}
        onDrop={(e) => editorRef?.current?.handleDrop(e)}
        onMouseDownCapture={onContainerMouseDown}
        onMouseUpCapture={onContainerMouseUp}
      >
        {!quickNote && (
          <div
            className={cn(
              'group/title flex w-full flex-row-reverse items-start gap-4 max-lg:flex-col md:gap-5 lg:gap-6',
              {
                'flex-col-reverse max-lg:flex-col-reverse': isMobile
              }
            )}
          >
            <NoteTitle
              ref={titleRef}
              note={note}
              onEnter={() => editorRef.current?.focus('start-newline')}
              onFocusNext={() => editorRef.current?.focus('restore')}
              autofocus={canAutofocusTitle}
            />
          </div>
        )}

        <div ref={editorContainerRef} className='w-full'>
          <NoteContent
            ref={editorRef}
            note={note}
            provider={provider}
            editable={editable}
            isSyncError={!!syncError}
            content={note?.description_html || EMPTY_HTML}
            onBlurAtTop={focusTitle}
            autofocus={canAutofocusDescription}
            onKeyDown={onKeyDownScrollHandler}
          />
        </div>
      </div>
    </div>
  )
}

interface NoteTitleProps {
  note?: Note
  autofocus?: boolean
  onEnter?: () => void
  onFocusNext?: () => void
}

const NoteTitle = forwardRef<HTMLTextAreaElement, NoteTitleProps>(function NoteTitle(props, ref) {
  const { note, autofocus, onEnter, onFocusNext } = props
  const [formTitle, setFormTitle] = useState(note?.title)
  const { mutate: updateNote } = useUpdateNote()
  const save = useCallback(() => {
    if (!note?.viewer_can_edit || !note?.id || formTitle === note.title) return
    updateNote(
      { noteId: note.id, title: formTitle ?? '' },
      {
        onError: apiErrorToast
      }
    )
  }, [note?.viewer_can_edit, note?.id, note?.title, formTitle, updateNote])
  const debouncedSave = useDebouncedCallback(save, 1000, { trailing: true })

  // keep external title changes in sync
  useEffect(() => {
    setFormTitle(note?.title)
  }, [note?.title])

  useBeforeRouteChange(save, !!note?.viewer_can_edit)

  return (
    <TitleTextField
      ref={ref}
      className='mx-auto w-full max-w-[44rem] text-[clamp(2rem,_4vw,_2.5rem)] font-bold leading-[1.2]'
      placeholder={note ? 'Untitled' : undefined}
      value={formTitle}
      onChange={(value) => {
        setFormTitle(value)
        debouncedSave()
      }}
      onEnter={onEnter}
      onFocusNext={onFocusNext}
      autoFocus={autofocus}
      readOnly={!note?.viewer_can_edit}
    />
  )
})

function ConnectionIssueBanner({ children }: { children: React.ReactNode }) {
  return (
    <button
      className='mx-auto mb-8 w-full max-w-[44rem] rounded-md border-yellow-200 bg-yellow-100 p-3 dark:border-yellow-800/50 dark:bg-yellow-950/30'
      onClick={() => {
        window.location.reload()
      }}
    >
      <UIText className='text-yellow-700 dark:text-yellow-500'>{children}</UIText>
    </button>
  )
}
