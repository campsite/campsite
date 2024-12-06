// Fork of the official Mention extension with Mark continuation support
// https://github.com/ueberdosis/tiptap/blob/main/packages/extension-mention/src/mention.ts

import { mergeAttributes, Node, Range } from '@tiptap/core'

import { handleRestoreMentionBackspace } from '../utils/handleRestoreMentionBackspace'
import { insertContent } from '../utils/insertContent'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    mention: {
      insertMention: (props: {
        id: string
        label: string
        username: string
        role: 'member' | 'app'
        range: Range
      }) => ReturnType
    }
  }
}

// See `addAttributes` below
export interface MentionNodeAttrs {
  /**
   * The identifier for the selected item that was mentioned, stored as a `data-id`
   * attribute.
   */
  id: string | null
  /**
   * The label to be rendered by the editor as the displayed text for this mentioned
   * item, if provided. Stored as a `data-label` attribute. See `renderLabel`.
   */
  label?: string | null
}

export type MentionOptions = {
  HTMLAttributes: Record<string, any>
}

export const Mention = Node.create<MentionOptions>({
  name: 'mention',

  addOptions() {
    return {
      HTMLAttributes: {
        class: 'mention'
      }
    }
  },

  group: 'inline',

  inline: true,

  selectable: false,

  atom: true,

  addAttributes() {
    return {
      id: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-id'),
        renderHTML: (attributes) => {
          if (!attributes.id) {
            return {}
          }

          return {
            'data-id': attributes.id
          }
        }
      },

      label: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-label'),
        renderHTML: (attributes) => {
          if (!attributes.label) {
            return {}
          }

          return {
            'data-label': attributes.label
          }
        }
      },

      role: {
        default: 'member',
        parseHTML: (element) => element.getAttribute('data-role'),
        renderHTML: (attributes) => {
          if (!attributes.role) {
            return {}
          }

          return {
            'data-role': attributes.role
          }
        }
      },

      username: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-username'),
        renderHTML: (attributes) => {
          if (!attributes.username) {
            return {}
          }

          return {
            'data-username': attributes.username
          }
        }
      }
    }
  },

  parseHTML() {
    return [
      {
        tag: `span[data-type="${this.name}"]`
      }
    ]
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(this.options.HTMLAttributes, { 'data-type': this.name }, HTMLAttributes),
      `@${node.attrs.label ?? node.attrs.id}`
    ]
  },

  renderText({ node }) {
    return `@${node.attrs.label ?? node.attrs.id}`
  },

  addCommands() {
    return {
      insertMention:
        ({ range, ...attrs }) =>
        ({ chain, state }) =>
          insertContent({
            chain,
            range,
            state,
            content: { type: this.name, attrs }
          })
    }
  },

  addKeyboardShortcuts() {
    return {
      Backspace: () =>
        this.editor.commands.command(({ tr, state }) =>
          handleRestoreMentionBackspace({ transaction: tr, state, nodeName: this.name, char: '@' })
        )
    }
  }
})
