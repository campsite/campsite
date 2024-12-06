import { Placeholder as TiptapPlaceholder } from '@tiptap/extension-placeholder'

export const Placeholder = TiptapPlaceholder.configure({
  emptyNodeClass: 'is-empty-prompt',
  placeholder: ({ node }) => {
    switch (node.type.name) {
      case 'heading':
        return `Heading ${node.attrs.level}`
      case 'detailsSummary':
        return 'Section title'
      case 'codeBlock':
        // never show the placeholder when editing code
        return ''
      default:
        return "Write, type '/' for commands, or paste/drag files"
    }
  },
  includeChildren: false
})
