import { getMarkType, MarkRange, Range } from '@tiptap/core'
import { MarkType } from '@tiptap/pm/model'
import { EditorState } from '@tiptap/pm/state'

export function isMarkActiveInRange(state: EditorState, typeOrName: MarkType | string | null, range: Range): boolean {
  if (typeof typeOrName === 'string' && !state.schema.marks[typeOrName]) {
    return false
  }

  const type = typeOrName ? getMarkType(typeOrName, state.schema) : null
  const { from, to } = range

  if (from === to) {
    return !!(state.storedMarks || state.selection.$from.marks()).filter((mark) => {
      if (!type) {
        return true
      }

      return type.name === mark.type.name
    })
  }

  let selectionRange = 0
  const markRanges: MarkRange[] = []

  state.doc.nodesBetween(from, to, (node, pos) => {
    if (!node.isText && !node.marks.length) {
      return
    }

    const relativeFrom = Math.max(from, pos)
    const relativeTo = Math.min(to, pos + node.nodeSize)
    const range = relativeTo - relativeFrom

    selectionRange += range

    markRanges.push(
      ...node.marks.map((mark) => ({
        mark,
        from: relativeFrom,
        to: relativeTo
      }))
    )
  })

  if (selectionRange === 0) {
    return false
  }

  // calculate range of matched mark
  const matchedRange = markRanges
    .filter((markRange) => {
      if (!type) {
        return true
      }

      return type.name === markRange.mark.type.name
    })
    .reduce((sum, markRange) => sum + markRange.to - markRange.from, 0)

  // calculate range of marks that excludes the searched mark
  // for example `code` doesn’t allow any other marks
  const excludedRange = markRanges
    .filter((markRange) => {
      if (!type) {
        return true
      }

      return markRange.mark.type !== type && markRange.mark.type.excludes(type)
    })
    .reduce((sum, markRange) => sum + markRange.to - markRange.from, 0)

  // we only include the result of `excludedRange`
  // if there is a match at all
  const finalRange = matchedRange > 0 ? matchedRange + excludedRange : matchedRange

  return finalRange >= selectionRange
}
