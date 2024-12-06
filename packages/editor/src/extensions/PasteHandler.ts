import { Extension } from '@tiptap/core'
import { toggleMark } from '@tiptap/pm/commands'
import { Slice } from '@tiptap/pm/model'
import { Plugin, PluginKey, TextSelection } from '@tiptap/pm/state'

import { ALIAS_TO_LANGUAGE } from '../utils/codeHighlightedLanguages'
import { createMarkdownParser } from '../utils/createMarkdownParser'
import { inlineLinkAttachmentType } from '../utils/inlineLinkAttachmentType'
import isInCode from '../utils/isInCode'
import isInList from '../utils/isInList'
import isInNewParagraph from '../utils/isInNewParagraph'
import isMarkdown from '../utils/isMarkdown'
import { isUrl } from '../utils/isUrl'
import normalizePastedMarkdown from '../utils/normalizePastedMarkdown'
import { parseCampsiteUrl } from '../utils/parseCampsiteUrl'
import { supportedResourceMention } from './ResourceMention'

function isDropboxPaper(html: string): boolean {
  // real example: <meta charset='utf-8'><span class=" author-d-1gg9uz65z1iz85zgdz68zmqkz84zo2qotvotu4z70znz76z3lfyyz86zz77zz68zz68zz122zvz65zjeo5tyz122zlz89z1r">foo</span>
  return html.startsWith("<meta charset='utf-8'>") && /author-d-[a-zA-Z0-9^"]+/.test(html)
}

function sliceSingleNode(slice: Slice) {
  return slice.openStart === 0 && slice.openEnd === 0 && slice.content.childCount === 1
    ? slice.content.firstChild
    : null
}

/**
 * Parses the text contents of an HTML string and returns the src of the first
 * iframe if it exists.
 *
 * @param text The HTML string to parse.
 * @returns The src of the first iframe if it exists, or undefined.
 */
function parseSingleIframeSrc(html: string) {
  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')

    if (doc.body.children.length === 1 && doc.body.firstElementChild?.tagName === 'IFRAME') {
      const iframe = doc.body.firstElementChild
      const src = iframe.getAttribute('src')

      if (src) {
        return src
      }
    }
  } catch (e) {
    // Ignore the million ways parsing could fail.
  }
  return undefined
}

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
            // Do nothing if the document isn't currently editable
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

            const html = event.clipboardData.getData('text/html')
            const vscode = event.clipboardData.getData('vscode-editor-data')

            // If the users selection is currently in a code block then paste
            // as plain text, ignore all formatting and HTML content.
            if (inCode) {
              event.preventDefault()
              view.dispatch(state.tr.insertText(text))
              return true
            }

            // Check if the clipboard contents can be parsed as a single url
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

              // If there is selected text then we want to wrap it in a link to the url
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

              if (schema.nodes.resourceMention) {
                const parsedUrl = parseCampsiteUrl(text)

                if (parsedUrl && supportedResourceMention(parsedUrl.subject)) {
                  this.editor.commands.insertResourceMention(text)
                  return true
                }
              }

              // If it's not an embed and there is no text selected – just go ahead and insert the
              // link directly
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

            // Because VSCode is an especially popular editor that places metadata
            // on the clipboard, we can parse it to find out what kind of content
            // was pasted.
            const vscodeMeta = vscode ? JSON.parse(vscode) : undefined
            const pasteCodeLanguage = vscodeMeta?.mode
            const supportsCodeBlock = !!state.schema.nodes.codeBlock
            const supportsCodeMark = !!state.schema.marks.code

            if (pasteCodeLanguage && pasteCodeLanguage !== 'markdown') {
              if (text.includes('\n') && supportsCodeBlock) {
                event.preventDefault()

                const node = state.schema.nodes.codeBlock.create(
                  {
                    language: Object.keys(ALIAS_TO_LANGUAGE).includes(vscodeMeta.mode) ? vscodeMeta.mode : null
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

              if (supportsCodeMark) {
                event.preventDefault()
                view.dispatch(
                  state.tr
                    .insertText(text, state.selection.from, state.selection.to)
                    .addMark(state.selection.from, state.selection.to + text.length, state.schema.marks.code.create())
                )
                return true
              }
            }

            // If the HTML on the clipboard is from Prosemirror then the best
            // compatability is to just use the HTML parser, regardless of
            // whether it "looks" like Markdown, see: outline/outline#2416
            if (html?.includes('data-pm-slice')) {
              return false
            }

            // If the text on the clipboard looks like Markdown OR there is no
            // html on the clipboard then try to parse content as Markdown
            if ((isMarkdown(text) && !isDropboxPaper(html)) || pasteCodeLanguage === 'markdown') {
              event.preventDefault()

              // get pasted content as slice
              const paste = pasteParser.parse(normalizePastedMarkdown(text))

              if (!paste) {
                return false
              }

              const slice = paste.slice(0)
              const tr = view.state.tr
              let currentPos = view.state.selection.from

              // If the pasted content is a single paragraph then we loop over
              // it's content and insert each node one at a time to allow it to
              // be pasted inline with surrounding content.
              const singleNode = sliceSingleNode(slice)

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

            // otherwise use the default HTML parser which will handle all paste
            // "from the web" events
            return false
          }
        }
      })
    ]
  }
})
