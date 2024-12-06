import { NodeViewRenderer } from '@tiptap/core'

import * as E from './extensions'
import { AutoJoiner } from './extensions/AutoJoiner'
import { CodeFenceMarkdownParser } from './extensions/CodeFenceMarkdownParser'
import { ImageMarkdownParser } from './extensions/ImageMarkdownParser'
import { ShiftEnterNewLineExtension } from './extensions/ShiftEnterNewLine'
import { SoftbreakMarkdownParser } from './extensions/SoftbreakMarkdownParser'

/**
 * The schema version of the note extensions.
 *
 * Some rules to maintain proper backwards compatibility:
 * - If you change the schema of an extension, bump the version number
 * - If you add a new extension, bump the version number
 * - Do NOT remove any extensions. If you want to, we should deprecate its use instead
 * - If you reorder the extensions, you do not need to bump the version number
 */
export const NOTE_SCHEMA_VERSION = 6

export interface GetNoteExtensionsOptions {
  link?: Partial<E.LinkOptions>

  taskItem?: Partial<E.TaskItemOptions>

  mention?: Partial<E.MentionOptions>

  postNoteAttachment?: Partial<E.PostNoteAttachmentOptions> & {
    addNodeView?(): NodeViewRenderer
  }

  linkUnfurl?: Partial<E.LinkUnfurlOptions> & {
    addNodeView?(): NodeViewRenderer
  }

  resourceMention?: Partial<E.ResourceMentionOptions> & {
    addNodeView?(): NodeViewRenderer
  }

  mediaGallery?: Partial<E.MediaGalleryOptions> & {
    addNodeView?(): NodeViewRenderer
  }

  comment?: Partial<E.CommentOptions> & {
    enabled?: boolean
  }

  details?: Partial<E.DetailsOptions>

  history?: {
    enabled?: boolean
  }

  dropcursor?: Partial<E.DropcursorOptions>

  codeBlockHighlighted?: Partial<E.CodeBlockHighlightedOptions>

  blurAtTop?: Partial<E.BlurAtTopOptions> & { enabled?: boolean }

  relativeTime?: Partial<E.RelativeTimeOptions> & {
    disabled?: boolean
    addNodeView?(): NodeViewRenderer
  }
}

export function getNoteExtensions(options?: GetNoteExtensionsOptions) {
  return [
    E.BlockDocument,

    ...(options?.history?.enabled !== false ? [E.History] : []),

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
    E.Dropcursor.configure(options?.dropcursor),
    E.Heading,
    E.ListItem,
    E.HorizontalRule,
    E.LinkUnfurl.extend({ addNodeView: options?.linkUnfurl?.addNodeView }),
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
    E.PasteHandler,
    CodeFenceMarkdownParser,
    ImageMarkdownParser,
    SoftbreakMarkdownParser,
    E.SplitNearHardBreaks,
    ShiftEnterNewLineExtension,

    ...(options?.blurAtTop?.enabled !== false ? [E.BlurAtTop.configure(options?.blurAtTop)] : []),

    E.Placeholder,
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
      addNodeView: options?.postNoteAttachment?.addNodeView
    }).configure(options?.postNoteAttachment),

    E.MediaGallery.extend({
      addNodeView: options?.mediaGallery?.addNodeView
    }).configure(options?.mediaGallery),

    E.MediaGalleryItem,

    E.ResourceMention.extend({
      addNodeView: options?.resourceMention?.addNodeView
    }).configure(options?.resourceMention),

    ...(options?.comment?.enabled !== false ? [E.Comment.configure(options?.comment)] : [])
  ]
}
