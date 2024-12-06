import { InputRule, mergeAttributes, Node as TipTapNode } from '@tiptap/core'

import { isMarkActiveInRange } from '../utils/isMarkActiveInRange'
import { isNodeActiveInRange } from '../utils/isNodeActiveInRange'

export interface RelativeTimeOptions {}

const inputRegex = /(?:^|\s)((?:1[0-2]|0?[1-9]):[0-5][0-9](?:am|pm)|(?:[01]?[0-9]|2[0-3]):[0-5][0-9])([.,!?\s])$/

export const RelativeTime = TipTapNode.create<RelativeTimeOptions>({
  name: 'relativeTime',
  group: 'inline',
  inline: true,
  selectable: true,
  atom: true,
  draggable: false,

  addAttributes() {
    return {
      timestamp: {
        default: 0
      },
      originalTz: {
        default: ''
      }
    }
  },

  parseHTML() {
    return [
      {
        tag: 'relative-time'
      }
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['relative-time', mergeAttributes(HTMLAttributes)]
  },

  addInputRules() {
    return [
      new InputRule({
        find: inputRegex,
        handler: ({ state, range, match }) => {
          // don't allow relative time in code
          if (isMarkActiveInRange(state, 'code', range) || isNodeActiveInRange(state, 'codeBlock', range)) {
            return
          }

          const [, time] = match
          const now = new Date()
          const [hours, minutes] = time.split(':')
          let parsedHours = parseInt(hours, 10)
          const parsedMinutes = parseInt(minutes, 10)

          // Check if it's 12-hour format
          if (time.toLowerCase().includes('am') || time.toLowerCase().includes('pm')) {
            const isPM = time.toLowerCase().includes('pm')

            if (isPM && parsedHours !== 12) {
              parsedHours += 12
            } else if (!isPM && parsedHours === 12) {
              parsedHours = 0
            }
          } else if (!time.startsWith('0')) {
            // For 24-hour format, if hour is before 7am (working hours), adjust so it falls in working hours
            // unless the time starts with a 0 (military time)
            // example: 3:00 should be 15:00 (3:00pm) instead of 3:00am, 20:00 should be 8:00pm, and 03:00 should be 3:00am
            if (parsedHours < 7) {
              parsedHours += 12
            }
          }

          const timestamp = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            parsedHours,
            parsedMinutes
          ).getTime()

          const originalTz = Intl.DateTimeFormat().resolvedOptions().timeZone
          const attributes = { timestamp, originalTz }
          const { tr } = state
          const start = range.from
          let end = range.to

          const newNode = this.type.create(attributes)

          if (match[1]) {
            const offset = match[0].lastIndexOf(match[1])
            let matchStart = start + offset

            if (matchStart > end) {
              matchStart = end
            } else {
              end = matchStart + match[1].length
            }

            // insert last typed character
            const lastChar = match[0][match[0].length - 1]

            tr.insertText(lastChar, start + match[0].length - 1)

            // insert node from input rule
            tr.replaceWith(matchStart, end, newNode)
          } else if (match[0]) {
            const insertionStart = this.type.isInline ? start : start - 1

            tr.insert(insertionStart, this.type.create(attributes)).delete(tr.mapping.map(start), tr.mapping.map(end))
          }

          tr.scrollIntoView()
        }
      })
    ]
  }
})
