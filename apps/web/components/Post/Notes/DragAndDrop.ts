import { Extension } from '@tiptap/core'
import { NodeSelection, Plugin, PluginKey, TextSelection } from '@tiptap/pm/state'
// @ts-ignore
import { __serializeForClipboard, EditorView } from '@tiptap/pm/view'

interface DragHandleOptions {
  dragHandleWidth: number
}

function absoluteRect(node: Element) {
  const data = node.getBoundingClientRect()

  return {
    top: data.top,
    left: data.left,
    width: data.width,
    height: data.height
  }
}

function nodeDOMAtCoords(coords: { x: number; y: number }) {
  return document.elementsFromPoint(coords.x, coords.y).find(
    (elem: Element) =>
      (elem.parentElement?.matches?.('.ProseMirror') && !elem.matches('ul, ol')) ||
      (elem.matches(['li', 'p:not(:first-child)', 'pre', 'blockquote', 'h1, h2, h3, h4, h5, h6'].join(', ')) &&
        // disable drag handles on elements inside tiptap-draggable containers or restricted elements
        !elem.closest('[data-drag-handle], blockquote'))
  )
}

function nodePosAtDOM(node: Element, view: EditorView) {
  const boundingRect = node.getBoundingClientRect()

  return view.posAtCoords({
    left: boundingRect.left + 1,
    top: boundingRect.top + 1
  })?.inside
}

function createDragImageNode(node: Element) {
  const dragNodeInner = document.createElement(node.parentElement?.tagName ?? 'div')
  const dragNode = document.createElement('div')

  // Clone the node and append it to the drag node
  dragNodeInner.appendChild(node.cloneNode(true))
  dragNode.classList.add('drag-node', 'prose')
  dragNode.appendChild(dragNodeInner)

  document.body.querySelectorAll('.drag-node')?.forEach((node) => node.remove())
  document.body.appendChild(dragNode)

  return dragNode
}

const X_OFFSET = 50

function DragHandle(options: DragHandleOptions) {
  function handleDragStart(event: DragEvent, view: EditorView) {
    view.focus()

    if (!event.dataTransfer) return

    const node = nodeDOMAtCoords({
      x: event.clientX + X_OFFSET + options.dragHandleWidth,
      y: event.clientY
    })

    if (!(node instanceof Element)) return

    const nodePos = nodePosAtDOM(node, view)

    if (nodePos == null || nodePos < 0) return

    view.dispatch(view.state.tr.setSelection(NodeSelection.create(view.state.doc, nodePos)))

    const slice = view.state.selection.content()
    const { dom, text } = __serializeForClipboard(view, slice)

    event.dataTransfer.clearData()
    event.dataTransfer.setData('text/html', dom.innerHTML)
    event.dataTransfer.setData('text/plain', text)
    event.dataTransfer.effectAllowed = 'copyMove'
    event.dataTransfer.setDragImage(createDragImageNode(node), 0, 0)

    view.dragging = { slice, move: event.ctrlKey }
  }

  function handleClick(event: MouseEvent, view: EditorView) {
    view.focus()

    view.dom.classList.remove('dragging')

    const node = nodeDOMAtCoords({
      x: event.clientX + X_OFFSET + options.dragHandleWidth,
      y: event.clientY
    })

    if (!(node instanceof Element)) return

    const nodePos = nodePosAtDOM(node, view)

    if (nodePos === undefined || nodePos < 0) return

    const pmNode = view.state.doc.nodeAt(nodePos)

    if (pmNode && (pmNode.isText || pmNode.type.name === 'paragraph')) {
      view.dispatch(
        view.state.tr.setSelection(TextSelection.create(view.state.doc, nodePos, nodePos + pmNode.nodeSize))
      )
    } else {
      view.dispatch(view.state.tr.setSelection(NodeSelection.create(view.state.doc, nodePos)))
    }

    event.preventDefault()
    event.stopPropagation()
  }

  let dragHandleElement: HTMLElement | null = null

  function hideDragHandle() {
    if (dragHandleElement) {
      dragHandleElement.classList.add('hide')
    }
  }

  function showDragHandle() {
    if (dragHandleElement) {
      dragHandleElement.classList.remove('hide')
    }
  }

  return new Plugin({
    key: new PluginKey('dragHandle'),
    view: (view) => {
      dragHandleElement = document.createElement('div')
      dragHandleElement.draggable = true
      dragHandleElement.dataset.dragHandle = ''
      dragHandleElement.classList.add('drag-handle')
      dragHandleElement.addEventListener('dragstart', (e) => {
        handleDragStart(e, view)
      })
      dragHandleElement.addEventListener('click', (e) => {
        handleClick(e, view)
      })

      hideDragHandle()

      view?.dom?.parentElement?.appendChild(dragHandleElement)

      // add scroll event listeners to the parent element
      // adding a scroll handleDOMEvent listener to the editor itself
      // doesn't seem to work; it never registers a scroll event
      const scrollContainer = document.getElementById('note-scroll-container')

      scrollContainer?.addEventListener('scroll', hideDragHandle)

      return {
        destroy: () => {
          dragHandleElement?.remove?.()
          dragHandleElement = null
          scrollContainer?.removeEventListener('scroll', hideDragHandle)
        }
      }
    },
    props: {
      handleDOMEvents: {
        mousemove: (view, event) => {
          if (!view.editable) return
          if (!dragHandleElement) return

          const node = nodeDOMAtCoords({
            x: event.clientX + X_OFFSET + options.dragHandleWidth,
            y: event.clientY
          })

          if (!(node instanceof Element) || node.hasAttribute('data-placeholder')) {
            hideDragHandle()
            return
          }

          const rect = absoluteRect(node)

          if (node.hasAttribute('data-hr-wrapper')) {
            const hrElement = node.querySelector('hr')

            if (!hrElement) return

            const hrRect = hrElement.getBoundingClientRect()
            const dragHandleHeight = dragHandleElement.getBoundingClientRect().height

            rect.top = hrRect.top - dragHandleHeight / 2
          } else {
            const compStyle = window.getComputedStyle(node)
            const lineHeight = parseInt(compStyle.lineHeight, 10)
            const paddingTop = parseInt(compStyle.paddingTop, 10)

            rect.top += (lineHeight - 24) / 2
            rect.top += paddingTop
          }

          // Li markers
          if (node.matches('ul li, ol li')) {
            rect.left -= options.dragHandleWidth
          }
          rect.width = options.dragHandleWidth

          dragHandleElement.style.left = `${rect.left - rect.width}px`
          dragHandleElement.style.top = `${rect.top}px`
          showDragHandle()
        },
        keydown: () => {
          hideDragHandle()
        },
        scroll: () => {
          hideDragHandle()
        },
        // dragging class is used for CSS
        dragstart: (view) => {
          view.dom.classList.add('dragging')
        },
        drop: (view) => {
          view.dom.classList.remove('dragging')
        },
        dragend: (view) => {
          view.dom.classList.remove('dragging')
        }
      }
    }
  })
}

interface DragAndDropOptions {}

export const DragAndDrop = Extension.create<DragAndDropOptions>({
  name: 'dragAndDrop',

  addProseMirrorPlugins() {
    return [
      DragHandle({
        dragHandleWidth: 24
      })
    ]
  }
})
