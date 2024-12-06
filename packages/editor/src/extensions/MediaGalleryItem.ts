import { Node } from '@tiptap/core'

import { InlineAttachmentAttributes } from './PostNoteAttachment'

export interface MediaGalleryItemOptions {}

export type MediaGalleryItemAttributes = Omit<InlineAttachmentAttributes, 'optimistic_id'> & {
  /**
   * MediaGallery requires stable node IDs that do not change when the file is uploaded.
   * For compatibility with our upload pipeline we call it `optimistic_id` instead of `node_id`.
   * (typically we throw away optimistic IDs after the file is uploaded; MediaGalleryItem retains them.)
   */
  optimistic_id: string
}

export const MediaGalleryItem = Node.create<MediaGalleryItemOptions>({
  name: 'mediaGalleryItem',
  group: 'customBlock',

  addOptions() {
    return {}
  },

  addAttributes() {
    return {
      id: {
        default: ''
      },
      optimistic_id: {
        default: '',
        // backwards compatibility for items without `optimistic_id` rendered in the final HTML
        parseHTML: (element) => element.getAttribute('optimistic_id') || element.getAttribute('id')
      },
      file_type: {
        default: ''
      },
      error: {
        default: null
      }
    }
  },

  addCommands() {
    return {}
  },

  parseHTML() {
    return [
      {
        tag: 'media-gallery-item'
      }
    ]
  },

  renderHTML(props) {
    return ['media-gallery-item', props.HTMLAttributes]
  }
})
