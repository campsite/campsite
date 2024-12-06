import { ComponentProps, forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react'
import { Editor } from '@tiptap/core'
import { EditorContent, ReactNodeViewRenderer, useEditor } from '@tiptap/react'
import { useDebouncedCallback } from 'use-debounce'

import {
  BlurAtTopOptions,
  focusAtStartWithNewline,
  getMarkdownExtensions,
  MediaGallery,
  MediaGalleryItem
} from '@campsite/editor'
import { Attachment } from '@campsite/types/generated'
import { useHasMounted } from '@campsite/ui/src/hooks'
import { cn } from '@campsite/ui/src/utils'

import { EMPTY_HTML } from '@/atoms/markdown'
import { InlineResourceMentionRenderer } from '@/components/InlineResourceMentionRenderer'
import { MentionList } from '@/components/MarkdownEditor/MentionList'
import { ReactionList } from '@/components/MarkdownEditor/ReactionList'
import { ResourceMentionList } from '@/components/MarkdownEditor/ResourceMentionList'
import { useCreateLinkAttachment } from '@/components/MarkdownEditor/useCreateLinkAttachment'
import { MediaGalleryRenderer } from '@/components/Post/MediaGalleryRenderer'
import { SlashCommand } from '@/components/Post/Notes/SlashCommand'
import { InlineRelativeTimeRenderer } from '@/components/RichTextRenderer/handlers/RelativeTime'
import { useCurrentUserOrOrganizationHasFeature } from '@/hooks/useCurrentUserOrOrganizationHasFeature'
import { setsAreEqual } from '@/utils/setsAreEqual'

import { CodeBlockLanguagePicker } from '../CodeBlockLanguagePicker'
import { EditorBubbleMenu } from '../EditorBubbleMenu'
import { LinkUnfurlRenderer } from '../Post/LinkUnfurlRenderer'
import { useUploadNoteAttachments } from '../Post/Notes/Attachments/useUploadAttachments'
import { PostInlineAttachmentRenderer } from '../Post/PostInlineAttachmentRenderer'
import { useControlClickLink } from './ControlClickLink'
import { useEditorFileHandlers } from './useEditorFileHandlers'

// Finds attachments inside a document, including those in a media gallery.
// We pass those IDs to the API to associate the attachments with a post, so that
// attachments that appear in the content are included in the API response for that post.
function getAttachmentsInDoc(editor: Editor) {
  const result = new Set<string>()

  editor.state.doc.nodesBetween(0, editor.state.doc.content.size, (node) => {
    if (node.type.name === 'postNoteAttachment' && node.attrs.id) {
      result.add(node.attrs.id)
    } else if (node.type.name === MediaGallery.name) {
      node.descendants((node) => {
        if (node.type.name === MediaGalleryItem.name && node.attrs.id) {
          result.add(node.attrs.id)
        }

        return false
      })
    }
  })

  return result
}

// Sometimes we conditionally change the ID of the editor, e.g. when the fixed comment bar goes into 'reply mode'.
// TipTap doesn't support changing the editor ID, so we focus the editor by querying its container, then the editor inside.
export function focusEditor(editorId: string) {
  const el = document.getElementById(editorId)?.querySelector('div[contenteditable]') as HTMLElement | null

  el?.focus?.()
}

type Props = {
  disabled?: boolean
  placeholder?: string
  content?: string
  onClick?: () => void
  onChangeDebounced?: (html: string) => void
  onChangeDebounceMs?: number
  onFocus?: () => void
  onBlur?: () => void
  onEmptyDidChange?: (isEmpty: boolean) => void
  autoFocus?: boolean | 'end' | 'start'
  isSubmitted?: boolean
  minHeight?: string
  maxHeight?: string
  textSize?: 'sm' | 'base'
  id?: string
  onInlineAttachmentsChange?: (attachments: Set<string>) => void
  containerClasses?: string
  enableInlineAttachments?: boolean
  enableInlineLinks?: boolean
  enableSyntaxHighlighting?: boolean
  initialAttachments?: Attachment[]
  appendBubbleMenuTo?: () => HTMLElement | null
  onBlurAtTop?: BlurAtTopOptions['onBlur']
  disableSlashCommand?: boolean
  disableMentions?: boolean
  disableReactions?: boolean
} & Pick<ComponentProps<typeof MentionList>, 'defaultMentions'>

export interface MarkdownEditorRef {
  getHTML(): string
  setHTML(html: string): void
  isEmpty(): boolean
  clearAndBlur(): void
  insertReaction: Editor['commands']['insertReaction']
  focus(pos?: 'start' | 'end' | 'restore' | 'start-newline'): void
  uploadAndAppendAttachments: (files: File[]) => Promise<void>
  isFocused(): boolean
}

const MarkdownEditor = forwardRef<MarkdownEditorRef, Props>((props, ref) => {
  const {
    id = '',
    content,
    placeholder,
    onClick,
    onChangeDebounced,
    onChangeDebounceMs = 300,
    onEmptyDidChange,
    autoFocus = false,
    isSubmitted,
    minHeight = '48px',
    maxHeight,
    textSize = 'base',
    defaultMentions,
    onInlineAttachmentsChange,
    containerClasses = 'px-3 py-2.5',
    enableInlineAttachments = false,
    enableInlineLinks = false,
    enableSyntaxHighlighting = false,
    initialAttachments,
    appendBubbleMenuTo,
    onBlurAtTop,
    disableSlashCommand = false,
    disableMentions = false,
    disableReactions = false
  } = props
  const hasMounted = useHasMounted()
  const linkOptions = useControlClickLink()
  const hasRelativeTime = useCurrentUserOrOrganizationHasFeature('relative_time')

  const inlineAttachmentsRef = useRef<Set<string> | null>(null)

  const onChangeDebouncedInner = useDebouncedCallback((editor: Editor) => {
    onChangeDebounced?.(editor.getHTML())
  }, onChangeDebounceMs)

  const createLinkAttachment = useCreateLinkAttachment()

  // TODO: move/rename this hook - using it because it contains logic for positional attachments
  const upload = useUploadNoteAttachments({ enabled: enableInlineAttachments })

  const extensions = useMemo(() => {
    return [
      ...getMarkdownExtensions({
        link: linkOptions,
        placeholder,

        postNoteAttachment: {
          onCreateLinkAttachment: enableInlineAttachments ? createLinkAttachment : undefined,
          addNodeView() {
            return ReactNodeViewRenderer(PostInlineAttachmentRenderer)
          }
        },

        mediaGallery: {
          addNodeView() {
            return ReactNodeViewRenderer(MediaGalleryRenderer)
          }
        },

        resourceMention: {
          addNodeView() {
            return ReactNodeViewRenderer(InlineResourceMentionRenderer, { contentDOMElementTag: 'span' })
          }
        },

        linkUnfurl: enableInlineLinks
          ? {
              addNodeView() {
                return ReactNodeViewRenderer(LinkUnfurlRenderer)
              }
            }
          : undefined,

        codeBlockHighlighted: {
          highlight: enableSyntaxHighlighting
        },

        enableInlineAttachments,
        blurAtTop: {
          enabled: !!onBlurAtTop,
          onBlur: onBlurAtTop
        },

        relativeTime: {
          disabled: !hasRelativeTime,
          addNodeView() {
            return ReactNodeViewRenderer(InlineRelativeTimeRenderer, { contentDOMElementTag: 'span' })
          }
        },

        ...(enableInlineAttachments
          ? {
              dropcursor: {
                class: 'text-blue-500',
                width: 2
              }
            }
          : {})
      })
    ]
  }, [
    linkOptions,
    placeholder,
    enableInlineAttachments,
    createLinkAttachment,
    enableInlineLinks,
    enableSyntaxHighlighting,
    onBlurAtTop,
    hasRelativeTime
  ])

  const editor = useEditor(
    {
      immediatelyRender: true,
      shouldRerenderOnTransaction: false,
      // this is buggy in safari, don't use it
      autofocus: false,
      editorProps: {
        attributes: {
          id: id,
          class: cn(
            'prose editing focus:outline-none w-full max-w-full overflow-hidden select-auto',
            {
              'text-sm': textSize === 'sm'
            },
            containerClasses
          ),
          style: `min-height: ${minHeight}; max-height: ${maxHeight};`
        }
      },
      parseOptions: {
        preserveWhitespace: true
      },
      extensions,
      content,
      editable: !props.disabled,
      onUpdate: ({ editor }) => {
        const htmlContent = editor.getHTML()

        /**
         * Note 1: `onEmptyDidChange` will return `false` for content that we'd later trim to a blank string, e.g. `<p> </p>` -> ''
         * We don't check for this here because it's expensive to do on every keypress, but if submitting blank content is a concern,
         * consumers of this component should check `trimHtml(editor.getHTML()) !== ''` before submitting.
         *
         * Note 2: We don't use `editor.isEmpty` because it only checks against inner content which can result in false negatives,
         * even if the node if valid by itself.
         */
        onEmptyDidChange?.(htmlContent === EMPTY_HTML)

        onChangeDebouncedInner(editor)

        if (onInlineAttachmentsChangeRef.current) {
          const newAttachments = getAttachmentsInDoc(editor)

          if (!inlineAttachmentsRef.current || !setsAreEqual(newAttachments, inlineAttachmentsRef.current)) {
            onInlineAttachmentsChangeRef.current(newAttachments)
            inlineAttachmentsRef.current = newAttachments
          }
        }
      }
    },
    [extensions, enableInlineAttachments]
  )

  const { onDrop, onPaste, tailDropcursorVisible, uploadAndAppendAttachments } = useEditorFileHandlers({
    enabled: enableInlineAttachments,
    upload,
    editor
  })

  const hasInsertedInitialAttachments = useRef(false)

  // Handles the case where a user edits a post with attachments that was created prior to adding inline attachments.
  // In this case, the attachments belong to the post but don't appear inline.
  // When the editor is initialized, we insert the non-inline attachments into the end of the post so the user can edit them.
  // Saving the post will convert the attachments from non-inline to inline.
  // This use case is probably pretty rare, but without it we risk losing attachments on old posts that users edti.
  useEffect(() => {
    if (initialAttachments && !hasInsertedInitialAttachments.current) {
      hasInsertedInitialAttachments.current = true

      const existingAttachments = getAttachmentsInDoc(editor)
      const attachmentsToAppend = initialAttachments.filter((a) => !existingAttachments.has(a.id))

      if (attachmentsToAppend.length) {
        editor.commands.insertAttachments(attachmentsToAppend, 'end')
      }
    }
  }, [editor, initialAttachments])

  useEffect(() => {
    editor.setEditable(!props.disabled)
  }, [editor, props.disabled])

  const onInlineAttachmentsChangeRef = useRef(onInlineAttachmentsChange)

  onInlineAttachmentsChangeRef.current = onInlineAttachmentsChange

  useImperativeHandle(
    ref,
    () => ({
      getHTML: () => editor.getHTML() || '',
      setHTML: (html: string) => editor.commands.setContent(html),
      isEmpty: () => !!editor.isEmpty,
      clearAndBlur: () => editor.chain().setContent(EMPTY_HTML).blur().run(),
      insertReaction: (props) => !!editor.commands.insertReaction(props),
      focus: (pos = 'start') => {
        if (!editor) return

        if (pos === 'start') {
          editor.commands.focus('start')
        } else if (pos === 'start-newline') {
          focusAtStartWithNewline(editor)
        } else if (pos === 'end') {
          editor.commands.focus('end')
        } else if (pos === 'restore') {
          editor.commands.focus()
        }
      },
      // until we've completely done away with the carousel, this receives an array of files when the user
      // presses the upload button and passes them to the code path that uploads and appends them to the editor.
      uploadAndAppendAttachments,
      isFocused: () => !!editor.isFocused
    }),
    [editor, uploadAndAppendAttachments]
  )

  // hacky solution to make the placeholder reactive
  // https://github.com/ueberdosis/tiptap/issues/1935#issuecomment-1344072244
  useEffect(() => {
    if (placeholder !== '') {
      editor.extensionManager.extensions.filter((extension) => extension.name === 'placeholder')[0].options[
        'placeholder'
      ] = placeholder
      editor.view.dispatch(editor.state.tr)
    }
  }, [editor, placeholder])

  useEffect(() => {
    if (content === EMPTY_HTML) {
      editor.commands?.clearContent()

      if (isSubmitted) {
        editor.commands?.blur()
      }
    }
  }, [content, editor, isSubmitted])

  useEffect(() => {
    if (hasMounted && autoFocus) {
      try {
        editor.commands?.focus(autoFocus)
      } catch (e) {
        // Do nothing, this can crash if the editor is not mounted and we try to focus it (e.g. when the editor HMR)
      }
    }
  }, [hasMounted, editor]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      {!props.disabled && <EditorBubbleMenu editor={editor} tippyAppendTo={appendBubbleMenuTo} />}
      {enableSyntaxHighlighting && <CodeBlockLanguagePicker editor={editor} />}
      {!disableSlashCommand && <SlashCommand editor={editor} upload={upload} />}
      {!disableMentions && <MentionList editor={editor} defaultMentions={defaultMentions} />}
      {!disableMentions && <ResourceMentionList editor={editor} />}
      {!disableReactions && <ReactionList editor={editor} />}

      <EditorContent
        className='flex flex-1'
        editor={editor}
        onClick={onClick}
        onFocus={props.onFocus}
        onBlur={props.onBlur}
        onPaste={onPaste}
        onDrop={onDrop}
      />
      <div
        className={cn('mx-auto h-[2px] max-w-[44rem] bg-blue-500', {
          hidden: !tailDropcursorVisible
        })}
      />
    </>
  )
})

MarkdownEditor.displayName = 'MarkdownEditor'

export default MarkdownEditor
