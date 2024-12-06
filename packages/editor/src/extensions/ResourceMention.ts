import { Node, Range } from '@tiptap/core'

import { handleRestoreMentionBackspace } from '../utils/handleRestoreMentionBackspace'
import { insertContent } from '../utils/insertContent'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    resourceMention: {
      insertResourceMention: (href: string, range?: Range) => ReturnType
    }
  }
}

export function supportedResourceMention(type: string) {
  return type === 'notes' || type === 'posts' || type === 'calls'
}

export interface ResourceMentionOptions {}

export const ResourceMention = Node.create<ResourceMentionOptions>({
  name: 'resourceMention',
  group: 'inline',
  inline: true,
  selectable: true,
  atom: true,
  draggable: false,

  addOptions() {
    return {
      render: () => null
    }
  },

  addAttributes() {
    return {
      href: {
        default: ''
      }
    }
  },

  parseHTML() {
    return [
      {
        tag: 'resource-mention'
      }
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['resource-mention', HTMLAttributes]
  },

  addCommands() {
    return {
      insertResourceMention:
        (href, range) =>
        ({ chain, state }) =>
          insertContent({
            chain,
            range,
            state,
            content: {
              type: this.name,
              attrs: { href }
            }
          })
    }
  },

  addKeyboardShortcuts() {
    return {
      Backspace: () =>
        this.editor.commands.command(({ tr, state }) =>
          handleRestoreMentionBackspace({ transaction: tr, state, nodeName: this.name, char: '+' })
        )
    }
  }
})
