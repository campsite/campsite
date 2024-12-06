import { KeyboardEvent, useCallback } from 'react'
import { Editor } from '@tiptap/core'

import { isAlphaNumeric } from '@/utils/isAlphaNumeric'

interface Props {
  editor: Editor | null | undefined
}

export function useHandleBottomScrollOffset({ editor }: Props) {
  return useCallback(
    (event: KeyboardEvent) => {
      // ignore key presses that wouldn't insert a character
      if (!isAlphaNumeric(event.key) && event.key !== ' ') return

      /* 
      as the user is typing, if their cursor position is near the bottom of the page,
      scroll the page with them! this makes sure they're never bumped up against the
      bottom edge of the viewport
    */
      const selection = editor?.state?.selection
      // Do not scroll into view when we're doing a mass update (e.g. underlining text)
      // We only want the scrolling to happen during actual user input

      if (!selection?.empty) return

      // if the user isn't at the end of the document, don't scroll because it's jarring
      const docSize = editor?.state.doc.content.size
      const userIsAtEndOfDocument = docSize && selection.from >= docSize - 1

      if (!userIsAtEndOfDocument) return

      const scrollContainer = document.getElementById('note-scroll-container')

      if (!scrollContainer) return

      // add a ton of offset to account for variable bottom padding
      scrollContainer.scrollTo(0, scrollContainer.scrollHeight + 1000)
    },
    [editor]
  )
}
