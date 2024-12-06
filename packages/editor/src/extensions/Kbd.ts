import { Mark } from '@tiptap/core'

export interface KbdOptions {
  HTMLAttributes: Record<string, any>
}

// Commands are not implemented because kbd marks can't be created in the editor.
// We use them for keyboard shortcuts in default org and user content.
declare module '@tiptap/core' {
  interface Commands {
    kbd: {}
  }
}

export const Kbd = Mark.create<KbdOptions>({
  name: 'kbd',
  inclusive: false,
  excludes: '_',

  addOptions() {
    return {
      HTMLAttributes: {}
    }
  },

  group: 'inline',

  parseHTML() {
    return [{ tag: 'kbd' }]
  },

  renderHTML() {
    return ['kbd']
  }
})
