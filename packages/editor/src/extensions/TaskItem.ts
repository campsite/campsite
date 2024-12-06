import { InputRule, isNodeActive } from '@tiptap/core'
import {
  inputRegex,
  TaskItem as TiptapTaskItem,
  TaskItemOptions as TiptapTaskItemOptions
} from '@tiptap/extension-task-item'
import { Node } from '@tiptap/pm/model'
import { canJoin, findWrapping } from '@tiptap/pm/transform'

import { createMarkdownParserSpec } from '../utils/createMarkdownParser'

export interface TaskItemOptions extends Omit<TiptapTaskItemOptions, 'onReadOnlyChecked'> {
  canEdit?(): boolean
  onReadOnlyChecked?(node: Node, checked: boolean, index: number): boolean
}

export const TaskItem = TiptapTaskItem.extend<TaskItemOptions>({
  addAttributes() {
    return {
      checked: {
        default: false,
        keepOnSplit: false,
        parseHTML: (element) => element.getAttribute('data-checked') === 'true',
        renderHTML: (attributes) => ({
          'data-checked': `${!!attributes.checked}`
        })
      }
    }
  },
  addNodeView() {
    // copied from https://github.com/ueberdosis/tiptap/blob/main/packages/extension-task-item/src/task-item.ts
    // with tabIndex being set
    return ({ node, HTMLAttributes, getPos, editor }) => {
      const listItem = document.createElement('li')
      const checkboxWrapper = document.createElement('label')
      const checkboxStyler = document.createElement('span')
      const checkbox = document.createElement('input')
      const content = document.createElement('div')

      checkboxWrapper.contentEditable = 'false'
      checkbox.type = 'checkbox'
      checkbox.tabIndex = -1
      checkbox.addEventListener('change', (event) => {
        const editable = this.options.canEdit?.() || editor.isEditable

        // if the editor isn’t editable and we don't have a handler for
        // readonly checks we have to undo the latest change
        if (!editable && !this.options.onReadOnlyChecked) {
          checkbox.checked = !checkbox.checked

          return
        }

        const { checked } = event.target as any

        if (editable && typeof getPos === 'function') {
          editor
            .chain()
            .focus(undefined, { scrollIntoView: false })
            .command(({ tr }) => {
              const position = getPos()
              const currentNode = tr.doc.nodeAt(position)

              tr.setNodeMarkup(position, undefined, {
                ...currentNode?.attrs,
                checked
              })

              return true
            })
            .run()
        }
        if (!editable && this.options.onReadOnlyChecked) {
          // The backend receives the index of the checkbox in the document to update its checked status
          const container = document.querySelector(`[contenteditable="false"]`)
          const inputs = container?.querySelectorAll('input[type="checkbox"]')
          const index = Array.from(inputs ?? []).indexOf(checkbox)

          // unlikely, but do nothing if the index is not found
          if (index < 0) return

          // Reset state if onReadOnlyChecked returns false
          if (!this.options.onReadOnlyChecked(node, checked, index)) {
            checkbox.checked = !checkbox.checked
          } else {
            // toggle the TaskList checked attribute to update styles immediately
            const li = checkbox.closest('li')

            if (li) {
              li.dataset.checked = checkbox.checked ? 'true' : 'false'
            }
          }
        }
      })

      Object.entries(this.options.HTMLAttributes).forEach(([key, value]) => {
        listItem.setAttribute(key, value)
      })

      listItem.dataset.checked = node.attrs.checked
      if (node.attrs.checked) {
        checkbox.setAttribute('checked', 'checked')
      }

      checkboxWrapper.append(checkbox, checkboxStyler)
      listItem.append(checkboxWrapper, content)

      Object.entries(HTMLAttributes).forEach(([key, value]) => {
        listItem.setAttribute(key, value)
      })

      return {
        dom: listItem,
        contentDOM: content,
        update: (updatedNode) => {
          if (updatedNode.type !== this.type) {
            return false
          }

          listItem.dataset.checked = updatedNode.attrs.checked
          if (updatedNode.attrs.checked) {
            checkbox.setAttribute('checked', 'checked')
          } else {
            checkbox.removeAttribute('checked')
          }

          return true
        }
      }
    }
  },

  addInputRules() {
    const { type } = this

    return [
      new InputRule({
        find: inputRegex,
        handler: ({ state, range, match, chain }) => {
          if (isNodeActive(state, 'bulletList') || isNodeActive(state, 'orderedList')) {
            chain().deleteRange(range).toggleNode('paragraph', 'paragraph').run()
          } else {
            chain().deleteRange(range).run()
          }

          const tr = state.tr
          const attributes = { checked: match[match.length - 1] === 'x' }
          const $start = tr.doc.resolve(tr.selection.from)
          const blockRange = $start.blockRange()
          const wrapping = blockRange && findWrapping(blockRange, type, attributes)

          if (!wrapping) {
            return null
          }

          tr.wrap(blockRange, wrapping)

          const before = tr.doc.resolve(tr.selection.from - 1).nodeBefore

          if (before && before.type === type && canJoin(tr.doc, range.from - 1)) {
            tr.join(range.from - 1)
          }
        }
      })
    ]
  },

  markdownParseSpec() {
    return createMarkdownParserSpec({
      block: TaskItem.name,
      getAttrs: (token) => ({
        checked: token.attrGet('checked') === 'true'
      })
    })
  },

  markdownToken: 'task_item'
}).configure({
  HTMLAttributes: {
    class: 'task-item'
  },
  nested: true
})
