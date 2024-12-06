import { Editor } from '@tiptap/core'
import { atom } from 'jotai'

export const activeNoteEditorAtom = atom<Editor | null>(null)
