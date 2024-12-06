import { ChainedCommands, Editor, Node } from '@tiptap/core'
import { GapCursor } from '@tiptap/pm/gapcursor'

import { findNodeAndPos } from '../utils/findNodeAndPos'
import { insertNodes } from '../utils/insertNodes'

export interface PostNoteAttachmentOptions {
  onOpenAttachment: (id: string) => void
  onCreateLinkAttachment?: (props: { url: string; editor: Editor; chain: () => ChainedCommands }) => void
  disableComments: boolean
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    postNoteAttachment: {
      handleLinkAttachment: (url: string, pos?: number | 'end') => ReturnType
      insertAttachments: (attachments: InlineAttachmentAttributes[], pos?: number | 'end') => ReturnType
      updateAttachment: (optimistic_id: string, value: Partial<InlineAttachmentAttributes>) => ReturnType
    }
  }
}

export interface InlineAttachmentAttributes {
  id: string
  optimistic_id?: string | null
  file_type: string
  width: number
  height: number
  error?: string | null
}

export const PostNoteAttachment = Node.create<PostNoteAttachmentOptions>({
  name: 'postNoteAttachment',
  group: 'customBlock',
  selectable: true,
  atom: true,
  draggable: true,

  addOptions() {
    return {
      // eslint-disable-next-line no-empty-function
      onOpenAttachment: () => {},
      // eslint-disable-next-line no-empty-function
      onCreateLinkAttachment: () => {},
      disableComments: false
    }
  },

  addAttributes() {
    return {
      id: {
        default: ''
      },
      optimistic_id: {
        default: '',
        rendered: false
      },
      file_type: {
        default: ''
      },
      width: {
        default: 0
      },
      height: {
        default: 0
      },
      error: {
        default: null
      }
    }
  },

  addCommands() {
    return {
      handleLinkAttachment:
        (url) =>
        ({ dispatch, editor, chain, tr }) => {
          this.options.onCreateLinkAttachment?.({ url, editor, chain })

          tr.scrollIntoView()

          return dispatch?.(tr)
        },
      insertAttachments:
        (attachments, pos) =>
        ({ tr, state, dispatch }) => {
          const { schema } = state

          const nodes = attachments.map((attachment) => schema.nodes.postNoteAttachment.create(attachment))

          insertNodes({ pos, tr, nodes, schema })

          tr.scrollIntoView()

          return dispatch?.(tr)
        },
      updateAttachment:
        (optimistic_id: string, value: Partial<InlineAttachmentAttributes>) =>
        ({ tr, state, dispatch }) => {
          const match = findNodeAndPos(
            state,
            (n) => n.attrs.optimistic_id === optimistic_id && n.type.name === this.name
          )

          if (!match) {
            return false
          }

          const { pos } = match

          Object.entries(value).forEach(([key, value]) => {
            tr.setNodeAttribute(pos, key, value)
          })
          tr.setMeta('addToHistory', false)

          if (dispatch) {
            dispatch(tr)
            return true
          }
          return false
        }
    }
  },

  parseHTML() {
    return [
      {
        tag: 'post-attachment'
      }
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['post-attachment', HTMLAttributes]
  },

  addKeyboardShortcuts() {
    const maybeOpenAttachment =
      (options: PostNoteAttachmentOptions) =>
      ({ editor }: { editor: Editor }) => {
        // allow enter and space when the gap cursor is active
        if (editor.view.state.selection instanceof GapCursor) {
          return false
        }

        const node = editor.view.state.doc.nodeAt(editor.view.state.selection.from)

        if (!node || node.type !== this.type || !node.attrs.id) {
          return false
        }

        options.onOpenAttachment(node.attrs.id)
        return true
      }

    return {
      Space: maybeOpenAttachment(this.options)
    }
  }
})
