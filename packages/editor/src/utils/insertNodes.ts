import { Fragment, Node, Schema, Slice } from '@tiptap/pm/model'
import { TextSelection, Transaction } from '@tiptap/pm/state'

interface InsertNodesOptions {
  pos?: number | 'end'
  tr: Transaction
  nodes: Node[]
  schema: Schema
}

/**
 * Inserts nodes at a specific position in a document.
 */
export function insertNodes({ pos, tr, nodes, schema }: InsertNodesOptions) {
  const isAtEndOfDocument = pos === 'end' || (pos ?? tr.selection.to) === tr.doc.content.size - 1

  let offset = 0

  if (typeof pos === 'number') {
    nodes.reverse().forEach((node) => {
      tr.insert(pos, node)
    })
    offset = pos + nodes.reduce((acc, node) => acc + node.nodeSize, 0)
  } else if (pos === 'end') {
    nodes.reverse().forEach((node) => {
      tr.insert(tr.doc.content.size, node)
    })
    offset = tr.doc.content.size
  } else {
    tr.replaceSelection(new Slice(Fragment.from(nodes), 0, 0))
    offset = tr.selection.anchor
  }

  // if the selection is at the end of the doc, insert a new paragraph to avoid needing to use the gap cursor
  if (isAtEndOfDocument) {
    tr.insert(tr.doc.content.size, schema.nodes.paragraph.create()).setSelection(
      TextSelection.near(tr.doc.resolve(offset + 1))
    )
  } else {
    tr.setSelection(TextSelection.near(tr.doc.resolve(offset)))
  }
}
