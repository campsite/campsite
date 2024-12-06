import { mergeAttributes } from '@tiptap/core'
import { HorizontalRule as TiptapHorizontalRule } from '@tiptap/extension-horizontal-rule'

import { createMarkdownParserSpec } from '../utils/createMarkdownParser'

export const HorizontalRule = TiptapHorizontalRule.extend({
  parseHTML() {
    // even though we wrap with a div, this will detect <hr> in serialized HTML and convert it into a node
    return [{ tag: 'hr' }]
  },
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), ['hr']]
  },
  markdownParseSpec() {
    return createMarkdownParserSpec({ block: TiptapHorizontalRule.name, noCloseToken: true })
  },

  markdownToken: 'hr'
}).configure({
  HTMLAttributes: {
    'data-hr-wrapper': true
  }
})
