import { DetailsOptions, Details as TiptapDetails } from '@tiptap-pro/extension-details'
import { DetailsContent, DetailsContentOptions } from '@tiptap-pro/extension-details-content'
import { DetailsSummary, DetailsSummaryOptions } from '@tiptap-pro/extension-details-summary'
import { findParentNodeClosestToPos } from '@tiptap/core'

export type { DetailsContentOptions, DetailsOptions, DetailsSummaryOptions }

export const Details = TiptapDetails.extend({
  addKeyboardShortcuts() {
    return {
      ...this.parent?.(),
      Backspace: ({ editor }) => {
        const { selection } = editor.state

        const contentNode = findParentNodeClosestToPos(selection.$anchor, (node) => node.type.name === 'detailsContent')

        // if detailsContent is empty, move the cursor to the end of the detailsSummary
        if (contentNode && contentNode.node.textContent.length === 0 && contentNode.node.childCount === 1) {
          return this.editor
            .chain()
            .focus()
            .setTextSelection(contentNode.pos - 1)
            .run()
        }

        return this.parent?.().Backspace({ editor }) ?? false
      },
      Enter: ({ editor }) => {
        const {
          doc,
          schema,
          selection: { $head }
        } = editor.state

        // Handling the specific case where your cursor is inside a detailsSummary and you press Enter.
        // The default behavior is to insert a new line inside detailsContent - but if there's already a
        // new line there you'll end up with two new lines, and pressing enter again will continue inserting
        // new lines because your cursor isn't at the end of detailsContent.
        // Our solution is to listen for this specific Enter keypress and move the cursor down to the existing empty line.
        if ($head.parent.type === schema.nodes.detailsSummary) {
          const detailsNode = findParentNodeClosestToPos($head, (node) => node.type.name === 'details')
          const detailsEl = detailsNode ? (editor.view.nodeDOM(detailsNode.pos) as HTMLElement | null) : null
          const button = detailsEl?.querySelector(':scope > button') as HTMLButtonElement | null

          // find the button and open the details if it's not already open (this extension does not expose a toggle method)
          if (detailsEl && button) {
            const isOpen = detailsEl.classList.contains(this.options.openClassName)

            if (!isOpen) button.click()
          }

          const nextNode = doc.nodeAt($head.after())

          if (nextNode?.type.name === 'detailsContent') {
            return editor
              .chain()
              .focus()
              .setTextSelection($head.after() + 2)
              .run()
          }
        }

        return this.parent?.().Enter({ editor }) ?? false
      }
    }
  }
}).configure({
  HTMLAttributes: {
    class: 'details'
  }
})

export { DetailsContent, DetailsSummary }
