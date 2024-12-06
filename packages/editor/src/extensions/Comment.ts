import { Mark, mergeAttributes, Range } from '@tiptap/core'
import { Mark as PMMark } from '@tiptap/pm/model'
import { Plugin, PluginKey, TextSelection } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'
import { v4 as uuid } from 'uuid'

import { recreateTransform } from '../lib/recreate-transform'
import { isRemoteTransaction } from '../utils/isRemoteTransaction'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    comment: {
      setNewComment: () => ReturnType
      unsetNewComment: () => ReturnType
      setComment: (commentId: string, range: Range) => ReturnType
      unsetComment: (commentId: string) => ReturnType
    }
  }
}

export interface MarkWithRange {
  mark: PMMark
  range: Range
}

export interface ActiveEditorComment {
  id: string
  newCommentRange?: Range
}

export interface CommentOptions {
  HTMLAttributes: Record<string, any>
  onCommentActivated?: (comment: ActiveEditorComment | null) => void
  onCommentHovered?: (comment: ActiveEditorComment | null) => void
}

const commentKey = new PluginKey('commentPlugin')
const hoverKey = new PluginKey('commentHoverPlugin')

export const Comment = Mark.create<CommentOptions>({
  name: 'comment',
  exitable: true,
  inclusive: false,
  excludes: '',

  addOptions() {
    return {
      HTMLAttributes: {
        class: 'note-comment'
      },
      onCommentActivated: undefined,
      onCommentDeactivated: undefined
    }
  },

  addAttributes() {
    return {
      commentId: {
        default: ''
      }
    }
  },

  parseHTML() {
    return [
      {
        tag: 'span[commentId]'
      }
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
  },

  addCommands() {
    const { type } = this

    return {
      // Adds a new decoration to the selected range. The decoration applies a highlight effect.
      // The onCommentActivated option is called in view.update() when a decoration is detected.
      // The decoration is removed automatically when the selection changes.
      setNewComment:
        () =>
        ({ state, tr, dispatch }) => {
          // bail if there is no selection range
          if (state.selection.from === state.selection.to) return false

          tr.setMeta(commentKey, {
            add: {
              optimisticId: uuid(),
              from: state.selection.from,
              to: state.selection.to
            }
          }).setMeta('addToHistory', false)
          tr.setSelection(TextSelection.near(tr.doc.resolve(state.selection.to)))
          return dispatch?.(tr)
        },
      unsetNewComment:
        () =>
        ({ tr, dispatch }) => {
          tr.setMeta(commentKey, { removeAll: true }).setMeta('addToHistory', false)
          return dispatch?.(tr)
        },
      setComment:
        (commentId, range) =>
        ({ state, tr, dispatch }) => {
          const attributes = { commentId }

          state.doc.nodesBetween(range.from, range.to, (node, pos) => {
            const trimmedFrom = Math.max(pos, range.from)
            const trimmedTo = Math.min(pos + node.nodeSize, range.to)
            const someHasMark = node.marks.find((mark) => mark.type === type)

            // if there is already a mark of this type
            // we know that we have to merge its attributes
            // otherwise we add a fresh new mark
            if (someHasMark) {
              node.marks.forEach((mark) => {
                if (type === mark.type) {
                  tr.addMark(
                    trimmedFrom,
                    trimmedTo,
                    type.create({
                      ...mark.attrs,
                      ...attributes
                    })
                  )
                }
              })
            } else {
              tr.addMark(trimmedFrom, trimmedTo, type.create(attributes))
            }
          })

          tr.setMeta('addToHistory', false)

          return dispatch?.(tr)
        },
      unsetComment:
        (commentId) =>
        ({ tr, dispatch }) => {
          if (!commentId) return false

          const commentMarksWithRange: MarkWithRange[] = []

          tr.doc.descendants((node, pos) => {
            const commentMark = node.marks.find(
              (mark) => mark.type.name === 'comment' && mark.attrs.commentId === commentId
            )

            if (!commentMark) return

            commentMarksWithRange.push({
              mark: commentMark,
              range: {
                from: pos,
                to: pos + node.nodeSize
              }
            })
          })

          commentMarksWithRange.forEach(({ mark, range }) => {
            tr.removeMark(range.from, range.to, mark)
          })

          tr.setMeta('addToHistory', false)

          return dispatch?.(tr)
        }
    }
  },

  addProseMirrorPlugins() {
    let isActive = false
    const { editor, options } = this
    const { onCommentActivated, onCommentHovered } = options

    function show(activeComment: ActiveEditorComment) {
      isActive = true
      onCommentActivated?.(activeComment)
    }

    function hide() {
      if (isActive) {
        isActive = false
        // automatically remove new-comment decorations when hiding
        editor.commands.unsetNewComment()
        onCommentActivated?.(null)
      }
    }

    return [
      ...(onCommentHovered
        ? [
            new Plugin({
              key: hoverKey,
              props: {
                handleDOMEvents: {
                  mouseover(view, event) {
                    const pos = view.posAtDOM(event.target as HTMLElement, 0)

                    const node = view.state.doc.nodeAt(pos)
                    const mark = node?.marks.find((mark) => mark.type === view.state.schema.marks.comment)

                    if (mark) {
                      onCommentHovered?.({ id: mark.attrs.commentId })
                    } else {
                      onCommentHovered?.(null)
                    }
                  }
                }
              }
            })
          ]
        : []),

      new Plugin({
        key: commentKey,
        view() {
          return {
            update(view) {
              const decos = commentKey.getState(view.state).find(view.state.selection.to)
              let activeComment: ActiveEditorComment | undefined

              if (decos.length > 0) {
                const deco = decos[0]
                const id = deco.type.attrs.optimisticId
                const range = { from: deco.from, to: deco.to }

                if (id) {
                  activeComment = {
                    newCommentRange: range,
                    id
                  }
                }
              }

              if (activeComment) {
                show(activeComment)
              }
            }
          }
        },
        state: {
          init() {
            return DecorationSet.empty
          },
          apply(tr, set) {
            // fixup decorations after a remote yjs transform
            if (isRemoteTransaction(tr)) {
              const mapping = recreateTransform(tr.before, tr.doc, true, false).mapping

              return set.map(mapping, tr.doc)
            } else {
              set = set.map(tr.mapping, tr.doc)
            }

            const action = tr.getMeta(commentKey)

            if (action && action.add) {
              const { optimisticId, from, to } = action.add
              const deco = Decoration.inline(from, to, { optimisticId, class: 'note-comment' })

              set = set.add(tr.doc, [deco])
            } else if (action && action.removeAll) {
              set = set.remove(set.find())
            }
            return set
          }
        },
        props: {
          decorations(state) {
            return this.getState(state)
          },
          handleClick(view, pos) {
            const $pos = view.state.doc.resolve(pos)
            let marks = $pos.marks()

            // If there are no marks at the position, check the node and previous node
            // to see if there are any marks there. This is needed for the case where
            // a comment is only on a single character.
            if (!marks.length) {
              const node = view.state.doc.nodeAt(pos)

              if (node?.text?.length === 1 && node?.marks.length) {
                marks = node.marks
              } else if (pos > 0) {
                const beforeNode = view.state.doc.nodeAt(pos - 1)

                if (beforeNode?.text?.length === 1 && beforeNode?.marks.length) {
                  marks = beforeNode.marks
                }
              }
            }

            let activeComment: ActiveEditorComment | undefined

            if (marks.length > 0) {
              const mark = marks.find((mark) => mark.type === view.state.schema.marks.comment)
              const id = mark?.attrs.commentId

              if (id) {
                activeComment = { id }
              }
            }

            if (activeComment) {
              show(activeComment)
            } else {
              hide()
            }
          }
        }
      })
    ]
  }
})
