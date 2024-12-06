import { Extension } from '@tiptap/core'
import { TextSelection } from '@tiptap/pm/state'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    splitNearHardBreaks: {
      splitNearHardBreaks: () => ReturnType
    }
  }
}

export const SplitNearHardBreaks = Extension.create({
  name: 'splitNearHardBreaks',

  addCommands() {
    return {
      splitNearHardBreaks:
        () =>
        ({ state, tr, dispatch }) => {
          const { $from, $to } = state.selection

          let prevMatch: { from: number; to: number } | undefined
          let nextMatch: { from: number; to: number } | undefined

          $from.parent.descendants((child, offset) => {
            // if the next hardBreak is found, we're done
            if (nextMatch) return false

            if (child.type.name === 'hardBreak') {
              const brFrom = $from.start() + offset
              const brTo = brFrom + child.nodeSize

              // pick the nearest br on the left of the selection
              const isBrLeftOfSelection = brFrom < $from.pos
              // pick the nearest br on the right of the selection
              // allow br that are the tail of the selection
              const isBrRightOrEndOfSelection = brTo >= $to.pos

              if (isBrLeftOfSelection) {
                // overwrite previous so that the one nearest the selection is selected
                prevMatch = { from: brFrom, to: brTo }
              } else if (isBrRightOrEndOfSelection) {
                nextMatch = { from: brFrom, to: brTo }

                // abort iterating when we match beyond the selection
                return false
              }
            }
          })

          if (dispatch) {
            let from = $from.pos
            let to = $to.pos

            if (prevMatch) {
              tr.delete(prevMatch.from, prevMatch.to)

              const splitPos = tr.mapping.map(prevMatch.from)

              tr.split(splitPos)

              from = splitPos + 1
            }
            if (nextMatch) {
              // map in case we did a delete+split
              const nextFrom = tr.mapping.map(nextMatch.from)
              const nextTo = tr.mapping.map(nextMatch.to)

              tr.delete(nextFrom, nextTo)

              const splitPos = tr.mapping.map(nextFrom)

              tr.split(splitPos)

              to = splitPos
            }

            const didChange = !!prevMatch || !!nextMatch

            if (didChange) {
              // if the selection was split, we need to update the from and to so chained commands effect the split range
              tr.setSelection(TextSelection.between(tr.doc.resolve(from), tr.doc.resolve(to)))
              return true
            }

            return false
          }

          return false
        }
    }
  }
})
