import { Node } from '@tiptap/core'
import { Fragment, Node as ProseMirrorNode } from '@tiptap/pm/model'

import { findNodeAndPos } from '../utils/findNodeAndPos'
import { insertNodes } from '../utils/insertNodes'
import { MediaGalleryItem } from './MediaGalleryItem'
import { InlineAttachmentAttributes } from './PostNoteAttachment'

export interface MediaGalleryOptions {
  onOpenAttachment?: (attachmentId: string, galleryId?: string) => void
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    mediaGallery: {
      insertGallery: (gallery_id: string, attachments: InlineAttachmentAttributes[], pos?: number | 'end') => ReturnType
      appendGalleryItem: (gallery_id: string, attachment: InlineAttachmentAttributes) => ReturnType
      updateGalleryItem: (optimistic_id: string, value: Partial<InlineAttachmentAttributes>) => ReturnType
      removeGalleryItem: (optimistic_id: string) => ReturnType
      updateGalleryOrder: (gallery_id: string, item_ids: string[]) => ReturnType
    }
  }
}

export const MediaGallery = Node.create<MediaGalleryOptions>({
  name: 'mediaGallery',
  group: 'customBlock',
  content: 'mediaGalleryItem*',
  selectable: true,
  atom: true,
  draggable: true,

  addOptions() {
    return {
      // eslint-disable-next-line no-empty-function
      insertGallery: () => {},
      // eslint-disable-next-line no-empty-function
      appendGalleryItem: () => {},
      // eslint-disable-next-line no-empty-function
      updateGalleryItem: () => {},
      // eslint-disable-next-line no-empty-function
      removeGalleryItem: () => {},
      // eslint-disable-next-line no-empty-function
      updateGalleryOrder: () => {},
      // eslint-disable-next-line no-empty-function
      onOpenAttachment: () => {}
    }
  },

  addAttributes() {
    return {
      id: {
        type: String,
        default: ''
      }
    }
  },

  addCommands() {
    return {
      insertGallery:
        (galleryId, attachments, pos) =>
        ({ tr, state, dispatch }) => {
          const { schema } = state

          const contentNodes = attachments.map((attachment) => schema.nodes.mediaGalleryItem.create(attachment))

          const nodes = [schema.nodes.mediaGallery.create({ id: galleryId }, contentNodes)]

          insertNodes({ pos, tr, nodes, schema })

          return dispatch?.(tr)
        },
      appendGalleryItem:
        (gallery_id: string, attachment: InlineAttachmentAttributes) =>
        ({ tr, state, dispatch }) => {
          const { schema } = state

          const galleryNode = findNodeAndPos(state, (n) => n.attrs.id === gallery_id && n.type.name === this.name)

          if (!galleryNode) return false

          const attachmentNode = schema.nodes.mediaGalleryItem.create(attachment)

          const insertPos = galleryNode.pos + galleryNode.node.nodeSize - 1

          tr.insert(insertPos, attachmentNode)

          return dispatch?.(tr)
        },
      updateGalleryItem:
        (optimistic_id: string, value: Partial<InlineAttachmentAttributes>) =>
        ({ tr, state, dispatch }) => {
          const match = findNodeAndPos(
            state,
            (n) => n.attrs.optimistic_id === optimistic_id && n.type.name === MediaGalleryItem.name
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
        },
      removeGalleryItem:
        (optimistic_id: string) =>
        ({ tr, state, dispatch }) => {
          let galleryPos = -1
          let galleryItemPos = -1

          // perform a manual search because we need the pos of the item and the pos of its parent gallery,
          // in case this is the last item and we need to delete the parent gallery
          state.doc.descendants((node, pos) => {
            // not a MediaGallery
            if (node.type.name !== this.name) return true

            node.descendants((child, childPos) => {
              // not a MediaGalleryItem
              if (child.type.name !== MediaGalleryItem.name) return true

              // not the item we want to delete
              if (child.attrs.optimistic_id !== optimistic_id) return true

              galleryItemPos = pos + childPos + 1
              galleryPos = pos

              return false
            })

            return false
          })

          if (galleryPos === -1 || galleryItemPos === -1) return false

          const mediaGalleryNode = state.doc.nodeAt(galleryPos)

          if (!mediaGalleryNode) return false

          let newTr = tr.delete(
            galleryItemPos,
            galleryItemPos + mediaGalleryNode.child(galleryItemPos - galleryPos - 1).nodeSize
          )

          const updatedMediaGalleryNode = newTr.doc.nodeAt(galleryPos)

          if (!updatedMediaGalleryNode) return false

          if (updatedMediaGalleryNode.childCount === 0) {
            newTr = newTr.delete(galleryPos, galleryPos + updatedMediaGalleryNode.nodeSize)
          }

          return dispatch?.(newTr)
        },
      updateGalleryOrder: (gallery_id: string, newOrder: string[]) => {
        return ({ tr, state, dispatch }) => {
          const galleryNode = findNodeAndPos(state, (n) => n.attrs.id === gallery_id && n.type.name === this.name)

          if (!galleryNode) return false

          const nodeStartPos = galleryNode.pos + 1

          const initialItems = getInitialItems(galleryNode.node)
          const newItems = getNewItems(newOrder, initialItems)

          const newContent = Fragment.fromArray(Array.from(newItems.values()))

          tr.replaceWith(nodeStartPos, nodeStartPos + galleryNode.node.content.size, newContent)

          if (tr.docChanged) {
            return dispatch?.(tr)
          }

          return false
        }
      }
    }
  },

  parseHTML() {
    return [
      {
        tag: 'media-gallery'
      }
    ]
  },

  renderHTML(props) {
    return ['media-gallery', props.HTMLAttributes, 0]
  }
})

function getInitialItems(node: ProseMirrorNode) {
  const initialItems = new Map<string, ProseMirrorNode>()

  node.descendants((child) => {
    initialItems.set(child.attrs.optimistic_id, child)
  })

  return initialItems
}

function getNewItems(newOrder: string[], initialItems: Map<string, ProseMirrorNode>) {
  const newItems = new Map<string, ProseMirrorNode>()

  newOrder.forEach((optimistic_id) => {
    newItems.set(optimistic_id, initialItems.get(optimistic_id)!)
  })

  return newItems
}
