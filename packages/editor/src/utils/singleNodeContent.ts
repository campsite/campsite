import { Node, Slice } from '@tiptap/pm/model'

export function singleNodeContent(slice: Slice): Node | null {
  return slice.openStart === 0 && slice.openEnd === 0 && slice.content.childCount === 1
    ? slice.content.firstChild
    : null
}
