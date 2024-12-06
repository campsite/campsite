import { NodeViewRenderer } from '@tiptap/core'

import * as E from './extensions'
import { AutoJoiner } from './extensions/AutoJoiner'
import { CodeFenceMarkdownParser } from './extensions/CodeFenceMarkdownParser'
import { ImageMarkdownParser } from './extensions/ImageMarkdownParser'
import { PasteHandler } from './extensions/PasteHandler'
import { ShiftEnterNewLineExtension } from './extensions/ShiftEnterNewLine'
import { SoftbreakMarkdownParser } from './extensions/SoftbreakMarkdownParser'

export interface GetMarkdownExtensionsOptions {
  link?: Partial<E.LinkOptions>

  placeholder?: string

  mention?: Partial<E.MentionOptions>

  dropcursor?: Partial<E.DropcursorOptions>

  postNoteAttachment?: Partial<E.PostNoteAttachmentOptions> & {
    postId?: string
    addNodeView?(): NodeViewRenderer
  }

  mediaGallery?: Partial<E.MediaGalleryOptions> & {
    addNodeView?(): NodeViewRenderer
  }

  linkUnfurl?: Partial<E.LinkUnfurlOptions> & {
    addNodeView?(): NodeViewRenderer
  }

  resourceMention?: Partial<E.ResourceMentionOptions> & {
    addNodeView?(): NodeViewRenderer
  }

  codeBlockHighlighted?: Partial<E.CodeBlockHighlightedOptions>

  enableInlineAttachments?: boolean

  taskItem?: Partial<E.TaskItemOptions>

  blurAtTop?: Partial<E.BlurAtTopOptions> & { enabled?: boolean }

  details?: Partial<E.DetailsOptions>

  relativeTime?: Partial<E.RelativeTimeOptions> & {
    disabled?: boolean
    addNodeView?(): NodeViewRenderer
  }
}

export function getMarkdownExtensions(options?: GetMarkdownExtensionsOptions) {
  return [
    E.BlockDocument,
    E.History,
    E.Paragraph,
    E.Text,
    E.Code,
    E.CodeBlockHighlighted.configure(options?.codeBlockHighlighted),
    E.Bold,
    E.Blockquote,
    E.Italic,
    E.Strike,
    E.OrderedList,
    E.BulletList,
    E.Heading,
    E.ListItem,
    E.HorizontalRule,
    E.Link.configure(options?.link),
    E.Underline,
    E.Hardbreak,
    E.Kbd,

    ...(options?.relativeTime?.disabled !== true
      ? [
          E.RelativeTime.extend({
            addNodeView: options?.relativeTime?.addNodeView
          }).configure(options?.relativeTime)
        ]
      : []),

    AutoJoiner.configure({
      nodeTypes: ['bulletList', 'orderedList', 'taskList']
    }),
    E.BlurOnEscape,
    E.ListKeyMap,
    PasteHandler.configure({
      enableInlineAttachments: options?.enableInlineAttachments || false
    }),
    CodeFenceMarkdownParser,
    ImageMarkdownParser,
    SoftbreakMarkdownParser,
    E.SplitNearHardBreaks,
    ShiftEnterNewLineExtension,

    ...(options?.blurAtTop?.enabled !== false ? [E.BlurAtTop.configure(options?.blurAtTop)] : []),

    E.Placeholder.configure({
      placeholder: options?.placeholder
    }),
    E.Typography,

    E.TaskItem.configure(options?.taskItem),
    E.TaskList,
    E.Mention.configure(options?.mention),
    E.Reaction,

    E.Details.configure(options?.details),
    E.DetailsContent.extend({
      content: '(block|customBlock?)+'
    }),
    E.DetailsSummary,

    E.PostNoteAttachment.extend({
      addNodeView: options?.postNoteAttachment?.addNodeView,
      postId: options?.postNoteAttachment?.postId
    }).configure(options?.postNoteAttachment),

    E.MediaGallery.extend({
      addNodeView: options?.mediaGallery?.addNodeView
    }).configure(options?.mediaGallery),

    E.MediaGalleryItem,

    E.ResourceMention.extend({
      addNodeView: options?.resourceMention?.addNodeView
    }).configure(options?.resourceMention),

    ...(options?.dropcursor ? [E.Dropcursor.configure(options?.dropcursor)] : []),

    ...(options?.linkUnfurl
      ? [
          E.LinkUnfurl.extend({
            addNodeView: options?.linkUnfurl?.addNodeView
          })
        ]
      : [])
  ]
}
