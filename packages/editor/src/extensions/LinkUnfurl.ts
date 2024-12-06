import { Node } from '@tiptap/core'

import { insertNodes } from '../utils/insertNodes'

const TAG_NAME = 'link-unfurl'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    linkUnfurl: {
      insertLinkUnfurl: (href: string, pos?: number | 'end') => ReturnType
    }
  }
}

export interface LinkUnfurlOptions {}

export const LinkUnfurl = Node.create<LinkUnfurlOptions>({
  name: 'linkUnfurl',
  group: 'customBlock',
  selectable: true,
  atom: true,
  draggable: true,

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
        tag: TAG_NAME
      }
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [TAG_NAME, HTMLAttributes]
  },

  addCommands() {
    return {
      insertLinkUnfurl:
        (href, pos) =>
        ({ tr, editor, dispatch, state }) => {
          const { schema } = state

          const nodes = [editor.schema.nodes.linkUnfurl.create({ href })]

          insertNodes({ pos, tr, nodes, schema })

          tr.scrollIntoView()

          return dispatch?.(tr)
        }
    }
  }
})
