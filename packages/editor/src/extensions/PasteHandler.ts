import { Extension } from '@tiptap/core'
import { toggleMark } from '@tiptap/pm/commands'
import { Plugin, PluginKey, TextSelection } from '@tiptap/pm/state'

import cleanMarkdown from '../utils/cleanMarkdown'
import { ALIAS_TO_LANGUAGE } from '../utils/codeHighlightedLanguages'
import { createMarkdownParser } from '../utils/createMarkdownParser'
import { inlineLinkAttachmentType } from '../utils/inlineLinkAttachmentType'
import { isDropboxPaper } from '../utils/isDropboxPaper'
import isInCode from '../utils/isInCode'
import isInList from '../utils/isInList'
import isInNewParagraph from '../utils/isInNewParagraph'
import isMarkdown from '../utils/isMarkdown'
import { isUrl } from '../utils/isUrl'
import { parseCampsiteUrl } from '../utils/parseCampsiteUrl'
import { parseSingleIframeSrc } from '../utils/parseSingleIframeSrc'
import { singleNodeContent } from '../utils/singleNodeContent'
import { supportedResourceMention } from './ResourceMention'

interface PasteHandlerOptions {
  enableInlineAttachments: boolean
}

export const PasteHandler = Extension.create<PasteHandlerOptions>({
  name: 'pasteHandler',

  addOptions() {
    return {
      enableInlineAttachments: false
    }
  },

  addProseMirrorPlugins() {
    let shiftKey = false

    const { schema, extensionManager } = this.editor
    const pasteParser = createMarkdownParser(schema, extensionManager.extensions)
    const { enableInlineAttachments } = this.options

    return [
      new Plugin({
        key: new PluginKey('pasteHandler'),
        props: {
          transformPastedHTML(html: string) {
            if (isDropboxPaper(html)) {
              // Fixes double paragraphs when pasting from Dropbox Paper
              html = html.replace(/<div><br><\/div>/gi, '<p></p>')
            }
            return html
          },
          handleDOMEvents: {
            keydown: (_, event) => {
              if (event.key === 'Shift') {
                shiftKey = true
              }
              return false
            },
            keyup: (_, event) => {
              if (event.key === 'Shift') {
                shiftKey = false
              }
              return false
            }
          },
          handlePaste: (view, event: ClipboardEvent) => {
            if (view.props.editable && !view.props.editable(view.state)) {
              return false
            }

            // Default behavior if there is nothing on the clipboard or were
            // special pasting with no formatting (Shift held)
            if (!event.clipboardData || shiftKey) {
              return false
            }

            // include URLs copied from the share sheet on iOS: https://github.com/facebook/lexical/pull/4478
            const textValue = event.clipboardData.getData('text/plain') || event.clipboardData.getData('text/uri-list')

            const { state, dispatch } = view
            const inCode = isInCode(state)
            const iframeSrc = parseSingleIframeSrc(event.clipboardData.getData('text/plain'))
            const text = iframeSrc && !inCode ? iframeSrc : textValue

            if (inCode) {
              event.preventDefault()
              view.dispatch(state.tr.insertText(text))
              return true
            }

            // is this a single URL?
            if (isUrl(text)) {
              // Handle converting links into attachments for supported services
              if (enableInlineAttachments && inlineLinkAttachmentType(text)) {
                this.editor.commands.handleLinkAttachment(text)
                return true
              }

              // If the clipboard data is files + a single URL, the user is likely pasting an image copied from
              // the web, and the URL is the source of the image. In this case, ignore the URL.
              if (event.clipboardData.files.length > 0) {
                return false
              }

              // wrap selected text in a link
              if (!state.selection.empty) {
                toggleMark(this.editor.schema.marks.link, { href: text })(state, dispatch)
                return true
              }

              // If in an empty root paragraph, insert a link unfurl
              if (!isInList(state) && isInNewParagraph(state)) {
                if (schema.nodes.linkUnfurl) {
                  this.editor.commands.insertLinkUnfurl(text)
                  return true
                }
              }

              // If editor supports resource mentions and the url is internal, insert a resource mention
              if (schema.nodes.resourceMention) {
                const parsedUrl = parseCampsiteUrl(text)

                if (parsedUrl && supportedResourceMention(parsedUrl.subject)) {
                  this.editor.commands.insertResourceMention(text)
                  return true
                }
              }

              const transaction = view.state.tr
                .insertText(text, state.selection.from, state.selection.to)
                .addMark(
                  state.selection.from,
                  state.selection.to + text.length,
                  state.schema.marks.link.create({ href: text })
                )

              view.dispatch(transaction)

              return true
            }

            const vscodeEditorData = event.clipboardData.getData('vscode-editor-data')
            const vscodeJSON = vscodeEditorData ? JSON.parse(vscodeEditorData) : undefined
            const vscodeLanguage = vscodeJSON?.mode

            if (vscodeLanguage && vscodeLanguage !== 'markdown') {
              if (text.includes('\n') && !!state.schema.nodes.codeBlock) {
                event.preventDefault()

                const node = state.schema.nodes.codeBlock.create(
                  {
                    language: Object.keys(ALIAS_TO_LANGUAGE).includes(vscodeJSON.mode) ? vscodeJSON.mode : null
                  },
                  schema.text(text)
                )
                const tr = state.tr

                tr.replaceSelectionWith(node)

                if (tr.selection.from === tr.doc.content.size - 1) {
                  const para = schema.nodes.paragraph.create()

                  tr.insert(tr.selection.from, para)
                    .setSelection(TextSelection.near(tr.doc.resolve(tr.selection.from + para.nodeSize + 1)))
                    .scrollIntoView()
                }

                view.dispatch(tr)

                return true
              }

              if (state.schema.marks.code) {
                event.preventDefault()
                view.dispatch(
                  state.tr
                    .insertText(text, state.selection.from, state.selection.to)
                    .addMark(state.selection.from, state.selection.to + text.length, state.schema.marks.code.create())
                )
                return true
              }
            }

            const html = event.clipboardData.getData('text/html')

            if (html?.includes('data-pm-slice')) {
              return false
            }

            if ((isMarkdown(text) && !isDropboxPaper(html)) || vscodeLanguage === 'markdown') {
              event.preventDefault()

              const paste = pasteParser.parse(cleanMarkdown(text))

              if (!paste) {
                return false
              }

              const slice = paste.slice(0)
              const singleNode = singleNodeContent(slice)
              const tr = view.state.tr
              let currentPos = view.state.selection.from

              if (singleNode?.type === this.editor.schema.nodes.paragraph) {
                singleNode.forEach((node) => {
                  tr.insert(currentPos, node)
                  currentPos += node.nodeSize
                })
              } else {
                singleNode ? tr.replaceSelectionWith(singleNode, shiftKey) : tr.replaceSelection(slice)
              }

              view.dispatch(tr.scrollIntoView().setMeta('paste', true).setMeta('uiEvent', 'paste'))
              return true
            }

            return false
          }
        }
      })
    ]
  }
})
