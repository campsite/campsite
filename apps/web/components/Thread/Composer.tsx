import {
  FormEvent,
  forwardRef,
  KeyboardEvent,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState
} from 'react'
import { Editor as CoreEditor, JSONContent } from '@tiptap/core'
import { EditorContent, ReactNodeViewRenderer, useEditor } from '@tiptap/react'
import deepEqual from 'fast-deep-equal'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { isMobile } from 'react-device-detect'
import { useDropzone } from 'react-dropzone'
import { useDebouncedCallback } from 'use-debounce'

import { getChatExtensions } from '@campsite/editor'
import { MessageThread, OrganizationMember } from '@campsite/types'
import { ArrowUpIcon, Button, CheckIcon, LayeredHotkeys, Tooltip } from '@campsite/ui'
import { cn, isMetaEnter } from '@campsite/ui/src/utils'

import { EMPTY_HTML, EMPTY_JSON } from '@/atoms/markdown'
import { EditorBubbleMenu } from '@/components/EditorBubbleMenu'
import { MentionList } from '@/components/MarkdownEditor/MentionList'
import { ReactionList } from '@/components/MarkdownEditor/ReactionList'
import { InlineRelativeTimeRenderer } from '@/components/RichTextRenderer/handlers/RelativeTime'
import { ComposerActions } from '@/components/Thread/ComposerActions'
import { useTypingIndicator } from '@/components/Thread/hooks/useTypingIndicator'
import { useUnfocusedPaste } from '@/components/Thread/hooks/useUnfocusedPaste'
import { MobileTypingIndicator, TypingIndicator } from '@/components/Thread/TypingIndicator'
import { ADD_ATTACHMENT_SHORTCUT, ComposerEditorRef } from '@/components/Thread/utils'
import { useAlphaNumericKeyPress } from '@/hooks/useAlphaNumericKeyPress'
import { useCurrentUserOrOrganizationHasFeature } from '@/hooks/useCurrentUserOrOrganizationHasFeature'
import { useStoredState } from '@/hooks/useStoredState'
import { trimHtml } from '@/utils/trimHtml'

import { GalleryThumbnail } from '../AttachmentLightbox/GalleryThumbnail'
import {
  attachmentsAtom,
  chatThreadPlacementAtom,
  editModeAtom,
  inReplyToAtom,
  removeAttachmentAtom,
  shouldMinimizeComposerActionsAtom
} from '../Chat/atoms'
import { useControlClickLink } from '../MarkdownEditor/ControlClickLink'
import { PostComposerRemoveButton } from '../PostComposer/PostComposerRemoveButton'
import { ReplyContent } from '../ReplyContent'

interface Props extends React.PropsWithChildren {
  thread?: MessageThread
  canSend: boolean
  onMessage: (message: string) => void
  onEditLastMessage?: () => void
  onScrollToBottom?: () => void
  onFocus?: () => void
  onBlur?: () => void
  autoFocus?: boolean
  id?: string
  onPaste: (event: React.ClipboardEvent<HTMLElement>) => void
  onUpload: (files: File[]) => void
  dropzone: ReturnType<typeof useDropzone>
}

export const Composer = forwardRef<HTMLFormElement, Props>(function Composer(
  {
    children,
    thread,
    canSend,
    onMessage,
    onEditLastMessage,
    onScrollToBottom,
    onFocus,
    onBlur,
    autoFocus = true,
    id,
    onPaste,
    onUpload,
    dropzone
  },
  ref
) {
  // while the state updates while you type, the TipTap editor will only use the initial value (from draft if present)
  // and then ignore any changes
  const [initialValue, setStoredValue] = useStoredState(['thread', thread?.id ?? 'new', 'composer'], EMPTY_JSON)
  const attachments = useAtomValue(attachmentsAtom)
  const [editMode, setEditMode] = useAtom(editModeAtom)
  const threadPlacement = useAtomValue(chatThreadPlacementAtom)
  const setShouldMinimizeComposerActions = useSetAtom(shouldMinimizeComposerActionsAtom)
  const [isEmpty, setIsEmpty] = useState(() => deepEqual(initialValue, EMPTY_JSON))
  const hasContent = !isEmpty || attachments.length > 0
  const canSendAttachments = attachments.every((attachment) => attachment.optimistic_ready)
  const editorRef = useRef<ComposerEditorRef>(null)
  const setDraftDebounced = useDebouncedCallback((editor: CoreEditor) => setStoredValue(editor.getJSON()), 300)
  const [inReplyTo, setInReplyTo] = useAtom(inReplyToAtom)

  // use refs to avoid rerendering the editor component. without these, the callbacks would change often as you type.
  const submitStateRef = useRef({ canSend, canSendAttachments, hasContent, onMessage })
  const onEditLastMessageRef = useRef(onEditLastMessage)

  submitStateRef.current = { canSend, canSendAttachments, hasContent, onMessage }
  onEditLastMessageRef.current = onEditLastMessage

  const onEditorSubmit = useCallback(() => {
    const { canSend, canSendAttachments, hasContent, onMessage } = submitStateRef.current
    const editor = editorRef.current?.editor()

    if (!editor) return false
    if (!canSend) return false
    if (!hasContent || !canSendAttachments) return false

    onMessage(trimHtml(editor?.getHTML() ?? EMPTY_HTML))
    onScrollToBottom?.()
    setStoredValue(EMPTY_JSON)

    editor.chain().clearContent(true).focus().run()

    return true
  }, [setStoredValue, onScrollToBottom])

  const onEditorUpdate = useCallback(
    (editor: CoreEditor) => {
      const isEmpty = editor.getText().trim().length === 0

      setIsEmpty(isEmpty)
      setDraftDebounced(editor)
      setShouldMinimizeComposerActions(!isEmpty)
    },
    [setDraftDebounced, setShouldMinimizeComposerActions]
  )

  const onEditorArrowUp = useCallback(() => {
    onEditLastMessageRef.current?.()
  }, [])

  const onUnfocusedPaste = useCallback(
    (event: React.ClipboardEvent<HTMLElement>) => {
      const text = event.clipboardData.getData('text/plain')

      if (text) return editorRef.current?.editor()?.chain().focus('end')
      onPaste(event)
    },
    [onPaste]
  )

  // after hitting escape to blur the input, this allows using global hotkeys like "g+i"
  const hasManuallyBlurredViaEscape = useRef(false)
  const onKeyPress = useCallback(
    (key: string) => {
      if (hasManuallyBlurredViaEscape.current) return

      // don't focus the input when a user starts typing if a thread is open in the chat hover card
      if (threadPlacement === 'hovercard') return
      editorRef.current?.editor()?.chain().focus('end').insertContent(key).run()
    },
    [threadPlacement]
  )

  useAlphaNumericKeyPress(onKeyPress, { includeSymbols: true })
  useUnfocusedPaste(onUnfocusedPaste)

  function onSubmit(e?: FormEvent<HTMLFormElement>) {
    e?.preventDefault()

    onEditorSubmit()
  }

  return (
    <>
      <LayeredHotkeys
        keys={ADD_ATTACHMENT_SHORTCUT}
        callback={dropzone.open}
        options={{ enableOnContentEditable: true, enableOnFormTags: true }}
      />

      <MobileTypingIndicator channelName={thread?.channel_name} threadId={thread?.id} />
      <form
        ref={ref}
        onSubmit={onSubmit}
        onPasteCapture={onPaste}
        className={cn('bg-primary relative z-10 flex flex-col gap-2 px-3 py-2', {
          'pb-safe-offset-2 [&:has(.ProseMirror-focused)]:pb-2': isMobile
        })}
        onKeyDownCapture={(evt) => {
          if (evt.key === 'Escape') {
            hasManuallyBlurredViaEscape.current = true

            if (editMode) {
              evt.preventDefault()
              evt.stopPropagation()
              setEditMode(null)
            }
          }
        }}
      >
        {children}

        <input className='sr-only' {...dropzone.getInputProps()} />

        {inReplyTo && (
          <ReplyContent
            content={inReplyTo.content}
            author={inReplyTo.sender.user}
            attachments={inReplyTo.attachments}
            onCancel={() => setInReplyTo(null)}
          />
        )}

        <div className='flex items-end gap-2'>
          <ComposerActions editorRef={editorRef} onUpload={onUpload} dropzone={dropzone} />

          <div className='flex flex-1 flex-col'>
            <div
              className={cn(
                'relative flex min-h-[36px] flex-1 flex-col rounded-[18px]',
                'bg-elevated border-1',
                dropzone.isDragActive &&
                  'border-blue-500 bg-blue-50 ring-2 ring-blue-100 hover:bg-blue-100/20 dark:bg-blue-900/20 dark:ring-blue-600 dark:ring-opacity-20'
              )}
              data-filled={hasContent}
            >
              <Attachments />

              <ComposerEditor
                ref={editorRef}
                initialValue={initialValue}
                autoFocus={autoFocus}
                id={id}
                channelName={thread?.channel_name}
                onUpdate={onEditorUpdate}
                onSubmit={onEditorSubmit}
                onArrowUp={onEditorArrowUp}
                onFocus={() => {
                  hasManuallyBlurredViaEscape.current = false
                  onFocus?.()
                }}
                onBlur={onBlur}
                defaultMentions={thread?.other_members}
              />

              <div className='absolute bottom-1 right-1 flex h-7 w-7 items-center justify-center'>
                <Button
                  round
                  variant={editMode ? 'important' : 'primary'}
                  type='submit'
                  iconOnly={
                    editMode ? <CheckIcon size={24} strokeWidth='2' /> : <ArrowUpIcon size={22} strokeWidth='2.5' />
                  }
                  accessibilityLabel='Send'
                  disabled={!canSend || !hasContent || !canSendAttachments}
                  onMouseDown={(e) => e.preventDefault()}
                  className='h-7 w-7'
                  tooltip='Send'
                  tooltipShortcut='enter'
                />
              </div>
            </div>

            <TypingIndicator channelName={thread?.channel_name} threadId={thread?.id} />
          </div>
        </div>
      </form>
    </>
  )
})

const Attachments = memo(function Attachments() {
  const attachments = useAtomValue(attachmentsAtom)
  const removeAttachment = useSetAtom(removeAttachmentAtom)

  if (attachments.length === 0) return null

  return (
    <ul className='flex flex-wrap items-end gap-1.5 px-3 pb-0.5 pt-2.5 lg:pb-0'>
      {attachments.map((attachment) => (
        <Tooltip
          key={attachment.id}
          label={attachment.name}
          delayDuration={0}
          align='start'
          side='top'
          alignOffset={16}
        >
          <li
            className={cn(
              'group/remove-container bg-elevated relative grid w-20 max-w-[80px] rounded-xl after:absolute after:inset-0 after:rounded-xl after:border after:border-black/5 after:content-[""] dark:after:border-white/5',
              attachment.height > attachment.width && 'max-h-[10em]'
            )}
          >
            <div
              className='max-h-full self-center overflow-hidden rounded-xl'
              style={{
                aspectRatio: `${attachment.width || 1} / ${attachment.height || 1}`
              }}
            >
              <div className={cn('flex shrink-0 items-center justify-center', 'absolute inset-0')}>
                <div className='relative h-full w-full overflow-hidden rounded-xl'>
                  <GalleryThumbnail attachment={attachment} size={1024} />
                </div>
              </div>
            </div>
            <PostComposerRemoveButton
              accessibilityLabel='Remove attachment'
              onClick={() => {
                if (!attachment.optimistic_id) return
                removeAttachment(attachment.optimistic_id)
              }}
              isLoading={!attachment.optimistic_ready}
            />
          </li>
        </Tooltip>
      ))}
    </ul>
  )
})

interface ComposerEditorProps {
  initialValue: JSONContent
  autoFocus: boolean
  id: string | undefined
  channelName: string | undefined
  defaultMentions?: OrganizationMember[]
  onUpdate: (editor: CoreEditor) => void
  onSubmit: () => void
  onArrowUp: () => void
  onFocus?: () => void
  onBlur?: () => void
}

const ComposerEditor = forwardRef<ComposerEditorRef, ComposerEditorProps>(function ComposerEditor(props, ref) {
  const {
    initialValue,
    autoFocus = true,
    id,
    channelName,
    defaultMentions,
    onUpdate,
    onSubmit,
    onArrowUp,
    onFocus,
    onBlur
  } = props

  const threadPlacement = useAtomValue(chatThreadPlacementAtom)
  const editMode = useAtomValue(editModeAtom)
  const [inReplyTo, setInReplyTo] = useAtom(inReplyToAtom)
  const submitRef = useRef(onSubmit)

  submitRef.current = onSubmit

  const hasRelativeTime = useCurrentUserOrOrganizationHasFeature('relative_time')
  const linkOptions = useControlClickLink()
  const extensions = useMemo(() => {
    return [
      ...getChatExtensions({
        link: linkOptions,
        placeholder: 'Chat...',
        submit: {
          enabled: !isMobile,
          onSubmit: () => submitRef.current()
        },
        relativeTime: {
          disabled: !hasRelativeTime,
          addNodeView() {
            return ReactNodeViewRenderer(InlineRelativeTimeRenderer, { contentDOMElementTag: 'span' })
          }
        }
      })
    ]
  }, [linkOptions, hasRelativeTime])

  const editor = useEditor(
    {
      immediatelyRender: true,
      shouldRerenderOnTransaction: false,
      editorProps: {
        attributes: {
          class: cn(
            'scrollbar-hide break-words focus:ring-0 focus:outline-none !dark:bg-transparent bg-quaternary border-transparent !bg-transparent focus:border-transparent focus:outline-0 focus:ring-0 max-h-[60vh] text-base lg:text-sm chat-prose overflow-y-auto select-auto',
            'pr-10 py-[6px] lg:py-[7px] pl-3'
          )
        }
      },
      extensions,
      autofocus: autoFocus && !isMobile ? 'end' : false,
      content: initialValue,
      onUpdate: ({ editor }) => onUpdate(editor)
    },
    [extensions]
  )

  // track the editor in a ref as if its null the imperitive handle may not update
  const innerRef = useRef(editor)

  innerRef.current = editor

  useImperativeHandle(
    ref,
    () => ({
      editor: () => innerRef.current
    }),
    []
  )

  useEffect(() => {
    if (editMode) {
      const currentContent = editor?.getHTML() ?? EMPTY_HTML

      editor.chain().setContent(editMode.content, true).focus().run()

      return () => {
        editor.chain().setContent(currentContent, true).focus().run()
      }
    }
    // including editor?.commands here causes an infinite loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editMode])

  useEffect(() => {
    if (inReplyTo) {
      requestAnimationFrame(() => {
        editor?.commands.focus()
      })
    }
    // including editor?.commands here causes an infinite loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inReplyTo])

  const onTyping = useTypingIndicator(channelName)

  function onKeyUp(event: KeyboardEvent<Element>) {
    if (editMode || editor?.isEmpty || event.metaKey || event.ctrlKey) {
      onTyping.cancel()
    } else {
      onTyping()
    }
  }

  function onKeyDownCapture(event: KeyboardEvent<Element>) {
    if (event.key === 'Escape' && inReplyTo && editor?.isEmpty) {
      event.preventDefault()
      event.stopPropagation()

      // don't blur the editor quite yet if the user is pressing escape
      // to clear the inReplyTo value
      setInReplyTo(null)
    } else if (
      event.key === 'ArrowUp' &&
      editor?.state.selection.$anchor.pos === 1 &&
      editor.state.selection.empty &&
      editor.isEmpty
    ) {
      event.preventDefault()
      event.stopPropagation()
      onArrowUp()
    } else if (isMetaEnter(event)) {
      event.preventDefault()
      event.stopPropagation()
      onSubmit()
    }
  }

  return (
    <>
      <MentionList editor={editor} defaultMentions={defaultMentions} modal={threadPlacement !== 'hovercard'} />
      <ReactionList editor={editor} modal={threadPlacement !== 'hovercard'} />
      <EditorBubbleMenu
        editor={editor}
        enableHeaders={false}
        enableLists={false}
        enableBlockquote={false}
        enableUnderline={false}
        enableCodeBlock={false}
      />
      <EditorContent
        id={id}
        editor={editor}
        onKeyUp={onKeyUp}
        onKeyDownCapture={onKeyDownCapture}
        onFocus={onFocus}
        onBlur={onBlur}
      />
    </>
  )
})
