import { findParentNodeClosestToPos, mergeAttributes, Node } from '@tiptap/core'
import { DOMParser as ProseMirrorDOMParser, Fragment, Node as ProseMirrorNode, Schema } from '@tiptap/pm/model'
import { TextSelection } from '@tiptap/pm/state'

export interface DetailsOptions {
  HTMLAttributes: Record<string, string>
  openClassName: string
}

export interface DetailsContentOptions {
  HTMLAttributes: Record<string, string>
}

export interface DetailsSummaryOptions {
  HTMLAttributes: Record<string, string>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    details: {
      setDetails: () => ReturnType
    }
  }
}

function parseFragment(schema: Schema, element: HTMLElement) {
  return ProseMirrorDOMParser.fromSchema(schema).parseSlice(element).content
}

function fragmentToArray(fragment: Fragment) {
  const nodes: ProseMirrorNode[] = []
  fragment.forEach((node) => {
    nodes.push(node)
  })
  return nodes
}

function createEmptyParagraph(schema: Schema) {
  return schema.nodes.paragraph.create()
}

function createSummaryNode(schema: Schema, element: HTMLElement) {
  const wrapper = element.ownerDocument.createElement('div')
  const summary = element.querySelector(':scope > summary')

  if (summary) {
    wrapper.append(summary.cloneNode(true))
    const parsedNode = parseFragment(schema, wrapper).firstChild

    if (parsedNode?.type === schema.nodes.detailsSummary) {
      return parsedNode
    }
  }

  const firstMeaningfulChild = Array.from(element.childNodes).find((child) => {
    if (child.nodeType === TEXT_NODE) {
      return child.textContent?.trim()
    }

    return true
  })

  const summaryText = firstMeaningfulChild?.textContent?.trim() || ''

  return schema.nodes.detailsSummary.create(
    null,
    summaryText ? [schema.text(summaryText)] : undefined
  )
}

function createContentNode(schema: Schema, element: HTMLElement) {
  const wrapper = element.ownerDocument.createElement('div')
  const explicitContent = element.querySelector(':scope > div[data-type="detailsContent"]')

  if (explicitContent) {
    wrapper.append(explicitContent.cloneNode(true))
    const parsedNode = parseFragment(schema, wrapper).firstChild

    if (parsedNode?.type === schema.nodes.detailsContent) {
      return parsedNode
    }
  }

  const childNodes = Array.from(element.childNodes).filter((child) => {
    if (child.nodeType === ELEMENT_NODE) {
      const childElement = child as HTMLElement

      if (childElement.matches('summary')) {
        return false
      }
    }

    return child.textContent?.trim() || child.nodeType === ELEMENT_NODE
  })

  const remainingNodes = element.querySelector(':scope > summary') ? childNodes : childNodes.slice(1)

  remainingNodes.forEach((child) => {
    wrapper.append(child.cloneNode(true))
  })

  const parsedContent = parseFragment(schema, wrapper)
  const contentNodes = parsedContent.size > 0 ? fragmentToArray(parsedContent) : [createEmptyParagraph(schema)]

  return schema.nodes.detailsContent.create(null, contentNodes)
}

export const Details = Node.create<DetailsOptions>({
  name: 'details',
  group: 'block',
  content: 'detailsSummary detailsContent',
  defining: true,
  isolating: true,

  addOptions() {
    return {
      HTMLAttributes: {
        class: 'details'
      },
      openClassName: 'is-open'
    }
  },

  parseHTML() {
    return [
      {
        tag: 'details',
        getContent: (element, schema) => {
          const detailsElement = element as HTMLElement
          const summaryNode = createSummaryNode(schema, detailsElement)
          const contentNode = createContentNode(schema, detailsElement)

          return Fragment.fromArray([summaryNode, contentNode])
        }
      }
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['details', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
  },

  addCommands() {
    return {
      setDetails:
        () =>
        ({ state, dispatch }) => {
          const { from, to } = state.selection
          const details = state.schema.nodes.details.create(null, [
            state.schema.nodes.detailsSummary.create(),
            state.schema.nodes.detailsContent.create(null, [createEmptyParagraph(state.schema)])
          ])

          let tr = state.tr.replaceRangeWith(from, to, details)

          tr = tr.setSelection(TextSelection.create(tr.doc, from + 2)).scrollIntoView()
          dispatch?.(tr)

          return true
        }
    }
  },

  addKeyboardShortcuts() {
    return {
      Backspace: ({ editor }) => {
        const { selection } = editor.state
        const contentNode = findParentNodeClosestToPos(selection.$anchor, (node) => node.type.name === 'detailsContent')

        if (contentNode && contentNode.node.textContent.length === 0 && contentNode.node.childCount === 1) {
          return editor.chain().focus().setTextSelection(contentNode.pos - 1).run()
        }

        return false
      },
      Enter: ({ editor }) => {
        const {
          doc,
          schema,
          selection: { $head }
        } = editor.state

        if ($head.parent.type === schema.nodes.detailsSummary) {
          const detailsNode = findParentNodeClosestToPos($head, (node) => node.type.name === 'details')
          const detailsEl = detailsNode ? (editor.view.nodeDOM(detailsNode.pos) as HTMLDetailsElement | null) : null
          const nextNode = doc.nodeAt($head.after())

          if (detailsEl && !detailsEl.open) {
            detailsEl.open = true
          }

          if (nextNode?.type.name === 'detailsContent') {
            return editor.chain().focus().setTextSelection($head.after() + 2).run()
          }
        }

        return false
      }
    }
  }
})

export const DetailsSummary = Node.create<DetailsSummaryOptions>({
  name: 'detailsSummary',
  content: 'inline*',
  defining: true,

  addOptions() {
    return {
      HTMLAttributes: {}
    }
  },

  parseHTML() {
    return [
      {
        tag: 'summary'
      }
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['summary', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
  }
})

export const DetailsContent = Node.create<DetailsContentOptions>({
  name: 'detailsContent',
  content: 'block+',
  defining: true,

  addOptions() {
    return {
      HTMLAttributes: {
        'data-type': 'detailsContent'
      }
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="detailsContent"]'
      }
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
  }
})
const ELEMENT_NODE = 1
const TEXT_NODE = 3
