import { EditorState, Transaction } from '@tiptap/pm/state'

export function handleRestoreMentionBackspace({
  transaction,
  state,
  nodeName,
  char
}: {
  transaction: Transaction
  state: EditorState
  nodeName: string
  char: string
}) {
  let isMention = false
  const { selection } = state
  const { empty, anchor } = selection

  if (!empty) {
    return false
  }

  state.doc.nodesBetween(anchor - 1, anchor, (node, pos) => {
    if (node.type.name === nodeName) {
      isMention = true
      transaction.insertText(char, pos, pos + node.nodeSize)

      return false
    }
  })

  return isMention
}
