import { useEffect, useMemo } from 'react'
import { HocuspocusProvider } from '@hocuspocus/provider'
import Collaboration from '@tiptap/extension-collaboration'
import CollaborationCursor from '@tiptap/extension-collaboration-cursor'
import { EditorOptions, ReactNodeViewRenderer, useEditor } from '@tiptap/react'

import { ActiveEditorComment, BlurAtTopOptions, getNoteExtensions, PostNoteAttachmentOptions } from '@campsite/editor'
import { cn } from '@campsite/ui/src/utils'

import { InlineResourceMentionRenderer } from '@/components/InlineResourceMentionRenderer'
import { useControlClickLink } from '@/components/MarkdownEditor/ControlClickLink'
import { MediaGalleryRenderer } from '@/components/Post/MediaGalleryRenderer'
import { InlineRelativeTimeRenderer } from '@/components/RichTextRenderer/handlers/RelativeTime'
import { useCurrentUserOrOrganizationHasFeature } from '@/hooks/useCurrentUserOrOrganizationHasFeature'
import { useGetCurrentUser } from '@/hooks/useGetCurrentUser'
import { notEmpty } from '@/utils/notEmpty'

import { LinkUnfurlRenderer } from '../LinkUnfurlRenderer'
import { NoteAttachmentRenderer } from './Attachments/NoteAttachmentRenderer'
import { useUploadNoteAttachments } from './Attachments/useUploadAttachments'
import { DragAndDrop } from './DragAndDrop'

const cursorColors = [
  ['bg-blue-500 border-blue-500 text-white', 'bg-blue-500/40'],
  ['bg-green-400 border-green-400 text-black', 'bg-green-400/40'],
  ['bg-yellow-300 border-yellow-300 text-black', 'bg-yellow-300/40'],
  ['bg-red-500 border-red-500 text-white', 'bg-red-500/40'],
  ['bg-purple-300 border-purple-300 text-black', 'bg-purple-300/40'],
  ['bg-pink-500 border-pink-500 text-white', 'bg-pink-500/40'],
  ['bg-indigo-500 border-indigo-500 text-white', 'bg-indigo-500/40'],
  ['bg-teal-300 border-teal-300 text-black', 'bg-teal-300/40']
]

interface NoteEditorOptions {
  content: string
  onOpenAttachment?: PostNoteAttachmentOptions['onOpenAttachment']
  autofocus?: boolean
  editable?: 'all' | 'viewer' | 'none'
  editorProps?: EditorOptions['editorProps']
  onHoverComment?(comment: ActiveEditorComment | null): void
  onActiveComment?(comment: ActiveEditorComment | null): void
  onBlurAtTop?: BlurAtTopOptions['onBlur']
  provider?: HocuspocusProvider | null
  upload?: ReturnType<typeof useUploadNoteAttachments>
}

export function useNoteEditor({
  content,
  autofocus,
  editable,
  editorProps,
  onHoverComment,
  onActiveComment,
  onOpenAttachment,
  onBlurAtTop,
  provider
}: NoteEditorOptions) {
  const { data: currentUser } = useGetCurrentUser()
  const linkOptions = useControlClickLink()
  const hasRelativeTime = useCurrentUserOrOrganizationHasFeature('relative_time')

  const extensions = useMemo(() => {
    return [
      ...getNoteExtensions({
        history: {
          enabled: !provider
        },
        dropcursor: {
          class: 'text-blue-500',
          width: 2
        },
        link: linkOptions,
        linkUnfurl: {
          addNodeView() {
            return ReactNodeViewRenderer(LinkUnfurlRenderer)
          }
        },
        taskItem: {
          canEdit() {
            return editable !== 'none'
          },
          onReadOnlyChecked() {
            return editable === 'viewer'
          }
        },
        postNoteAttachment: {
          onOpenAttachment,
          addNodeView() {
            return ReactNodeViewRenderer(NoteAttachmentRenderer)
          }
        },
        mediaGallery: {
          onOpenAttachment,
          addNodeView() {
            return ReactNodeViewRenderer(MediaGalleryRenderer)
          }
        },
        resourceMention: {
          addNodeView() {
            return ReactNodeViewRenderer(InlineResourceMentionRenderer, { contentDOMElementTag: 'span' })
          }
        },
        comment: {
          enabled: true,
          onCommentHovered: onHoverComment,
          onCommentActivated: onActiveComment
        },
        codeBlockHighlighted: {
          highlight: true
        },
        blurAtTop: {
          enabled: !!onBlurAtTop,
          onBlur: onBlurAtTop
        },
        relativeTime: {
          disabled: !hasRelativeTime,
          addNodeView() {
            return ReactNodeViewRenderer(InlineRelativeTimeRenderer, { contentDOMElementTag: 'span' })
          }
        }
      }),
      ...(provider
        ? [
            Collaboration.extend({
              onTransaction() {
                // IMPORTANT: this is a hacky fix to prevent scroll-jank on initial load in Safari
                this.editor.view.dom.style.overflowAnchor = ''
              }
            }).configure({
              document: provider.document
            }),
            CollaborationCursor.configure({
              provider: provider,
              render(user) {
                const element = document.createElement('div')
                const customColors = user.customColor?.split(' ') ?? []

                element.classList.add('collaboration-cursor__caret', ...customColors)
                const label = document.createElement('div')

                label.classList.add('collaboration-cursor__label', ...customColors)
                label.textContent = user.name
                element.appendChild(label)
                return element
              },
              selectionRender(user) {
                return {
                  class: cn(user.customSelection)
                }
              }
            })
          ]
        : []),
      DragAndDrop
    ].filter(notEmpty)
  }, [editable, linkOptions, onActiveComment, onBlurAtTop, onHoverComment, onOpenAttachment, provider, hasRelativeTime])

  const allEditable = editable === 'all'

  const editor = useEditor(
    {
      immediatelyRender: true,
      shouldRerenderOnTransaction: false,
      editorProps: {
        attributes: {
          class:
            'new-posts prose select-text focus:outline-none w-full relative note min-w-full px-[calc((100%-44rem)/2)]',
          style: "overflow-anchor: ''"
        },
        ...editorProps
      },
      extensions,
      autofocus: !!autofocus,
      content: provider ? undefined : content,
      editable: allEditable
    },
    [extensions]
  )

  useEffect(() => {
    if (editor.isEditable !== allEditable) {
      editor.setEditable(allEditable)
    }
  }, [editor, allEditable])

  useEffect(() => {
    if (!editor.commands.updateUser || !currentUser) return

    const index = currentUser.display_name.charCodeAt(0) % cursorColors.length
    const [customColor, customSelection] = cursorColors[index]

    editor.commands.updateUser({
      name: currentUser.display_name,
      customColor,
      customSelection
    })
  }, [editor, currentUser])

  return editor
}
