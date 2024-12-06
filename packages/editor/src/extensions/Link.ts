import { Editor, mergeAttributes } from '@tiptap/core'
import { Link as TiptapLink, LinkOptions as TiptapLinkOptions } from '@tiptap/extension-link'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { EditorView } from '@tiptap/pm/view'
import { find } from 'linkifyjs'

import { createMarkdownParserSpec } from '../utils/createMarkdownParser'

/**
 * Links the current word at the cursor if it is a valid URL.
 */
export function autolinkAtCursor(editor: Editor) {
  const before = editor.state.selection.$from.nodeBefore
  const currentWord = before?.textContent.split(' ').at(-1) ?? ''

  const link = find(currentWord).find((link) => link.isLink)

  if (!link) return null

  editor
    .chain()
    .setTextSelection({
      from: editor.state.selection.$from.pos - currentWord.length,
      to: editor.state.selection.$from.pos
    })
    .setMark('link', { href: link.href })
    .setTextSelection(editor.state.selection.$from.pos)
    .run()

  return link.href
}

export interface LinkOptions extends TiptapLinkOptions {
  truncated?: boolean
  hidden?: string[]
  onClick?: (view: EditorView, event: MouseEvent) => void
}

const HTTP_PREFIX_RE = {
  match: /^(?:https?:\/\/)?(?:www\.)?/i,
  replace: /\/$/
}

export const Link = TiptapLink.extend<LinkOptions>({
  inclusive: false,
  addOptions() {
    const parent = this.parent?.()

    return {
      ...parent,
      HTMLAttributes: {
        ...parent?.HTMLAttributes,
        class: 'prose-link'
      },
      linkOnPaste: true,
      openOnClick: false,
      truncated: false,
      hidden: []
    }
  },
  addAttributes() {
    const parent = this.parent?.()

    return {
      ...parent,
      class: {
        default: this.options.HTMLAttributes?.class,
        parseHTML: () => this.options.HTMLAttributes?.class,
        renderHTML: () => ({
          class: this.options.HTMLAttributes?.class
        })
      },
      rel: {
        default: this.options.HTMLAttributes?.rel,
        parseHTML: () => this.options.HTMLAttributes?.rel,
        renderHTML: () => ({
          rel: this.options.HTMLAttributes?.rel
        })
      },
      target: {
        default: this.options.HTMLAttributes?.target,
        parseHTML: () => this.options.HTMLAttributes?.target,
        renderHTML: () => ({
          target: this.options.HTMLAttributes?.target
        })
      },
      truncated: {
        default: false,
        keepOnSplit: false,
        parseHTML: (element) => {
          const href = element.getAttribute('href')
          const content = element.textContent

          return href === content
        },
        renderHTML: (attributes) => {
          if (!attributes.truncate) return {}

          const truncated = attributes.href.replace(HTTP_PREFIX_RE.match, '').replace(HTTP_PREFIX_RE.replace, '')

          return {
            'data-truncated': `${truncated.slice(0, 30)}${truncated.length > 30 ? '...' : ''}`
          }
        }
      }
    }
  },
  renderHTML({ HTMLAttributes }) {
    return ['a', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), ['span', {}, 0]]
  },
  // from this discussion https://github.com/ueberdosis/tiptap/issues/3389#issuecomment-1422608677
  addProseMirrorPlugins() {
    const plugins: Plugin[] = this.parent?.() || []

    const linkClickHandler = new Plugin({
      key: new PluginKey('handleLinkClick'),
      props: {
        handleDOMEvents: {
          click: this.options.onClick
        }
      }
    })

    plugins.push(linkClickHandler)

    return plugins
  },

  markdownParseSpec() {
    return createMarkdownParserSpec({
      mark: TiptapLink.name,
      getAttrs: (token) => ({
        href: token.attrGet('href'),
        title: token.attrGet('title') || null
      })
    })
  }
}).configure({
  HTMLAttributes: {
    target: '_blank'
  }
})
