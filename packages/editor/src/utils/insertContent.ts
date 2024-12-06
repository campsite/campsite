import { ChainedCommands, Content, Range } from '@tiptap/core'
import { EditorState } from '@tiptap/pm/state'

export function insertContent({
  chain,
  range,
  state,
  content,
  addSpace = true
}: {
  chain: () => ChainedCommands
  state: EditorState
  content: Content
  range?: Range
  addSpace?: boolean
}) {
  const contentToInsert = addSpace
    ? [
        content,
        {
          type: 'text',
          text: ' '
        }
      ]
    : content

  if (range) {
    // increase range.to by one when the next node is of type "text"
    // and starts with a space character
    const nodeAfter = state.selection.$to.nodeAfter
    const overrideSpace = nodeAfter?.text?.startsWith(' ')

    if (overrideSpace) {
      range.to += 1
    }

    chain().insertContentAt(range, contentToInsert)
  } else {
    chain().insertContent(contentToInsert)
  }

  // Continue marks
  state.selection.$to.marks().forEach((mark) => {
    chain().setMark(mark.type, mark.attrs)
  })

  const result = chain().focus().run()

  if (typeof window !== 'undefined') {
    const selection = window.getSelection()

    if (selection && selection.rangeCount > 0) {
      selection.collapseToEnd()
    }
  }

  return result
}
