import { NodeViewRenderer } from '@tiptap/core'

import * as E from './extensions'

export interface GetChatExtensionsOptions {
  link?: Partial<E.LinkOptions>
  placeholder?: string
  mention?: Partial<E.MentionOptions>
  submit?: Partial<E.EnterSubmitOptions> & { enabled?: boolean }
  relativeTime?: Partial<E.RelativeTimeOptions> & {
    disabled?: boolean
    addNodeView?(): NodeViewRenderer
  }
}

export function getChatExtensions(options?: GetChatExtensionsOptions) {
  return [
    ...E.StarterKit(),

    E.Bold,
    E.Italic,
    E.Strike,
    // chat doesn't support underline so remove it from the exclude list
    E.CodeWithoutUnderline,
    E.Link.configure(options?.link),
    E.Typography,

    ...(options?.relativeTime?.disabled !== true
      ? [
          E.RelativeTime.extend({
            addNodeView: options?.relativeTime?.addNodeView
          }).configure(options?.relativeTime)
        ]
      : []),

    E.BlurOnEscape,
    E.Placeholder.configure({
      placeholder: options?.placeholder
    }),

    ...(options?.submit?.enabled ? [E.EnterSubmit.configure(options.submit)] : []),

    E.Mention.configure(options?.mention),
    E.Reaction
  ]
}
