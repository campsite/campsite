import { Editor, Node } from '@tiptap/core'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import * as E from '../../extensions'
import { insertNodes } from '../insertNodes'

describe('insertNodes', () => {
  let editor: Editor

  const TestNode = Node.create({
    name: 'testNode',
    group: 'block',
    atom: true,
    addAttributes() {
      return {
        identifier: {
          default: ''
        }
      }
    },
    parseHTML() {
      return [{ tag: 'test-node' }]
    },
    renderHTML({ HTMLAttributes }) {
      return ['test-node', HTMLAttributes]
    }
  })

  function paragraphNode(content = 'Hello, world!') {
    const textNode = editor.schema.text(content)
    return editor.schema.nodes.paragraph.create({}, textNode)
  }

  beforeEach(() => {
    editor = new Editor({
      extensions: [E.Document, E.Text, E.Paragraph, TestNode],
      content: '<p>Foo bar</p><p>Cat dog</p>'
    })
  })

  afterEach(() => {
    editor.destroy()
  })

  it('inserts nodes at a specified position', () => {
    const { tr } = editor.state

    insertNodes({ pos: 8, tr, nodes: [paragraphNode()], schema: editor.schema })

    expect(tr.doc.content.childCount).toBe(3)
    expect(tr.doc.textContent).toBe('Foo barHello, world!Cat dog')
  })

  it('inserts nodes at the end of the document', () => {
    const { tr } = editor.state

    insertNodes({ pos: 'end', tr, nodes: [paragraphNode()], schema: editor.schema })

    editor.state.apply(tr)

    expect(tr.doc.textContent).toBe('Foo barCat dogHello, world!')
  })

  it('inserts a new paragraph at the end if inserting at the document end', () => {
    const { tr } = editor.state

    insertNodes({ pos: 'end', tr, nodes: [paragraphNode()], schema: editor.schema })

    expect(tr.doc.childCount).toBe(4) // Initial paragraphs, inserted content, and new paragraph
    expect(tr.doc.lastChild?.type.name).toBe('paragraph') // New paragraph should be the last child
    expect(tr.doc.lastChild?.textContent).toBe('')
  })
})
