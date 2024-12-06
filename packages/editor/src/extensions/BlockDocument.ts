import { Document as TiptapDocument } from '@tiptap/extension-document'

/**
 * Adds support for our `customBlock` group which includes LinkUnfurl, PostNoteAttachment, etc.
 * The default `content` value is 'block+'
 */
export const BlockDocument = TiptapDocument.extend({
  content: '(block | customBlock)+'
})
