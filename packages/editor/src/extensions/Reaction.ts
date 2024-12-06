import { mergeAttributes, Node, Range } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'

import { insertContent } from '../utils/insertContent'

const ReactionPluginKey = new PluginKey('reaction')

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    reaction: {
      insertReaction: (props: {
        id: string
        name: string
        native?: string
        file_url?: string
        range?: Range
      }) => ReturnType
    }
  }
}

export const Reaction = Node.create({
  name: 'reaction',
  group: 'inline',
  inline: true,
  selectable: false,

  addAttributes: () => ({
    id: {
      isRequired: true,
      parseHTML: (element) => element.getAttribute('data-id'),
      renderHTML: (attributes) => ({ 'data-id': attributes.id })
    },
    name: {
      isRequired: true,
      parseHTML: (element) => element.getAttribute('data-name'),
      renderHTML: (attributes) => ({ 'data-name': attributes.name })
    },
    /**
     * For attributes that are used as a prop and get rendered in the global renderHTML
     * (i.e. <img src={file_url} />), we need to explicitly set the attribute to a noop.
     * Otherwise, tiptap falls back to an internal implementation that unnecessarily
     * renders the value as a data attribute.
     */
    native: {
      parseHTML: (element) => element.textContent,
      renderHTML: () => void 0
    },
    file_url: {
      parseHTML: (element) => element.getAttribute('src'),
      renderHTML: () => void 0
    }
  }),

  parseHTML() {
    return [{ tag: `span[data-type="${this.name}"]` }, { tag: `img[data-type="${this.name}"]` }]
  },

  renderHTML({ HTMLAttributes, node }) {
    if (node.attrs.file_url) {
      return [
        'img',
        mergeAttributes(
          {
            'data-type': this.name,
            src: node.attrs.file_url,
            alt: node.attrs.name,
            draggable: 'false'
          },
          HTMLAttributes
        )
      ]
    }
    return ['span', mergeAttributes({ 'data-type': this.name }, HTMLAttributes), node.attrs.native]
  },

  renderText({ node }) {
    if (node.attrs.file_url) {
      return `:${node.attrs.name}:`
    }
    return node.attrs.native
  },

  addCommands() {
    return {
      insertReaction:
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

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: ReactionPluginKey,
        props: {
          /**
           * Highlight entire reaction node on double click
           */
          handleDoubleClickOn: (_, pos, node) => {
            if (node.type !== this.type) return false
            return this.editor.commands.setTextSelection({ from: pos, to: pos + node.nodeSize })
          }
        }
      })
    ]
  }
})
