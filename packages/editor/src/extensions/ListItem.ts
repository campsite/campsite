import { ListItem as TiptapListItem } from '@tiptap/extension-list-item'

import { createMarkdownParserSpec } from '../utils/createMarkdownParser'

export const ListItem = TiptapListItem.extend({
  addKeyboardShortcuts() {
    return {
      ...this.parent?.(),
      Enter: ({ editor }) =>
        editor.chain().splitListItem(this.name).unsetBold().unsetItalic().unsetUnderline().unsetCode().run()
    }
  },

  markdownParseSpec() {
    return createMarkdownParserSpec({ block: TiptapListItem.name })
  },

  markdownToken: 'list_item'
})
