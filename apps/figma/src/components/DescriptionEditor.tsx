import { forwardRef, useImperativeHandle, useMemo } from 'react'
import { Editor, EditorContent, useEditor } from '@tiptap/react'

import { getMarkdownExtensions } from '@campsite/editor'
import { cn } from '@campsite/ui/src/utils'

export const DescriptionEditor = forwardRef<{ editor: Editor | null }, {}>(function DescriptionEditor(_, ref) {
  const extensions = useMemo(() => {
    return getMarkdownExtensions({
      placeholder: 'Add a description (optional)'
      // TODO: add mention support
    })
  }, [])

  const editor = useEditor({
    editorProps: {
      attributes: {
        class: cn(
          'prose editing bg-elevated focus:outline-none w-full max-w-full overflow-y-auto select-auto px-3 py-2.5 h-[64px]',
          'shadow-sm border rounded-lg text-sm text-primary'
        )
      }
    },
    extensions
  })

  useImperativeHandle(ref, () => ({ editor }), [editor])
  return <EditorContent editor={editor} />
})
