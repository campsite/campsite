import { useMemo } from 'react'
import { EditorView } from '@tiptap/pm/view'

import { specialLinkClickHandler } from '@campsite/ui/Link'

import { useScope } from '@/contexts/scope'

export function useControlClickLink() {
  const { scope } = useScope()

  return useMemo(
    () => ({
      onClick(view: EditorView, event: MouseEvent) {
        return specialLinkClickHandler(`${scope}`, event, view.editable)
      }
    }),
    [scope]
  )
}
