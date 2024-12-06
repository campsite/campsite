import { useEffect } from 'react'
import { Editor } from '@tiptap/core'

import { useForceUpdate } from '@/hooks/useForceUpdate'

export function useRerenderNodeViewOnBlur(editor: Editor) {
  const forceUpdate = useForceUpdate()

  // TipTap react node views do not rerender on blur, so we need to force it
  useEffect(() => {
    editor.on('blur', forceUpdate)
    editor.on('focus', forceUpdate)

    return () => {
      editor.off('blur', forceUpdate)
      editor.off('focus', forceUpdate)
    }
  }, [forceUpdate, editor])
}
