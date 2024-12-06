import { Editor, Node } from '@tiptap/core'
import { describe, expect, it } from 'vitest'

import * as E from '../../extensions'
import { findNodeAndPos } from '../findNodeAndPos'

describe('findNodeAndPos', () => {
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

  it('finds matching position and node', () => {
    const editor = new Editor({
      extensions: [E.Document, E.Text, E.Paragraph, TestNode],
      content:
        '<p>Foo bar</p><test-node identifier="foo"></test-node><p>Cat dog</p><test-node identifier="bar"></test-node>'
    })

    const result = findNodeAndPos(editor.state, (node) => {
      return node.type === editor.schema.nodes.testNode && node.attrs.identifier === 'bar'
    })

    expect(result?.pos).toEqual(19)
    expect(result?.node.attrs.identifier).toEqual('bar')
  })
})
