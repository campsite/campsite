import { Editor } from '@tiptap/core'

const ADD_ATTACHMENT_SHORTCUT = 'mod+shift+u'

interface ComposerEditorRef {
  editor(): Editor | null
}

export type { ComposerEditorRef }
export { ADD_ATTACHMENT_SHORTCUT }
