import { findChildren } from '@tiptap/core'
import { Node as ProsemirrorNode } from '@tiptap/pm/model'
import { Plugin, PluginKey, Transaction } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'
import { refractor } from 'refractor'

import { isRemoteTransaction } from '../utils/isRemoteTransaction'

function parseNodes(nodes: any[], className: string[] = []): { text: string; classes: string[] }[] {
  return nodes
    .map((node) => {
      const classes = [...className, ...(node.properties ? node.properties.className : [])]

      if (node.children) {
        return parseNodes(node.children, classes)
      }

      return {
        text: node.value,
        classes
      }
    })
    .flat()
}

function getDecorations({ doc, name }: { doc: ProsemirrorNode; name: string }) {
  const decorations: Decoration[] = []

  findChildren(doc, (node) => node.type.name === name).forEach((block) => {
    const language = block.node.attrs.language || 'none'

    if (!language || language === 'none' || !refractor.registered(language)) {
      return
    }

    let from = block.pos + 1
    const nodes = refractor.highlight(block.node.textContent, language).children

    parseNodes(nodes).forEach((node) => {
      const to = from + node.text.length

      if (node.classes.length) {
        const decoration = Decoration.inline(from, to, {
          class: node.classes.join(' ')
        })

        decorations.push(decoration)
      }

      from = to
    })
  })

  return DecorationSet.create(doc, decorations)
}

export default function CodeHighlighting({ name }: { name: string }) {
  let highlighted = false

  return new Plugin({
    key: new PluginKey('codeHighlighting'),
    state: {
      init: (_, { doc }) => DecorationSet.create(doc, []),
      apply: (transaction: Transaction, decorationSet, oldState, newState) => {
        const nodeName = newState.selection.$head.parent.type.name
        const previousNodeName = oldState.selection.$head.parent.type.name
        const selectedCodeBlockChanged = transaction.docChanged && [nodeName, previousNodeName].includes(name)
        const oldNodes = findChildren(oldState.doc, (node) => node.type.name === name)

        // Apply decorations if:
        if (
          // this is the first highlight
          !highlighted ||
          // OR selection includes named node
          selectedCodeBlockChanged ||
          // OR transaction is a remote
          isRemoteTransaction(transaction) ||
          // OR transaction adds/removes named node,
          findChildren(newState.doc, (node) => node.type.name === name).length !== oldNodes.length ||
          // OR transaction has changes that completely encapsulte a node
          // (for example, a transaction that affects the entire document).
          // Such transactions can happen during collab syncing via y-prosemirror, for example.
          transaction.steps.some((step) => {
            return (
              // @ts-ignore
              step.from !== undefined &&
              // @ts-ignore
              step.to !== undefined &&
              oldNodes.some((node) => {
                return (
                  // @ts-ignore
                  node.pos >= step.from &&
                  // @ts-ignore
                  node.pos + node.node.nodeSize <= step.to
                )
              })
            )
          })
        ) {
          highlighted = true
          return getDecorations({ doc: transaction.doc, name })
        }

        return decorationSet.map(transaction.mapping, transaction.doc)
      }
    },
    view: (view) => {
      if (!highlighted) {
        // we don't highlight code blocks on the first render as part of mounting
        // as it's expensive (relative to the rest of the document). Instead let
        // it render un-highlighted and then trigger a defered render of Refractor
        // by updating the plugins metadata
        setTimeout(() => {
          if (!view.isDestroyed) {
            view.dispatch(view.state.tr.setMeta('refractor', { loaded: true }))
          }
        }, 10)
      }
      return {}
    },
    props: {
      decorations(state) {
        return this.getState(state)
      }
    }
  })
}
