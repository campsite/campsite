import { Editor } from '@tiptap/core'
import { TextSelection } from '@tiptap/pm/state'
import { NodeViewWrapperProps } from '@tiptap/react'

import { Button, cn, EyeHideIcon, TrashIcon } from '@campsite/ui'

import { RichLinkCard } from '@/components/RichLinkCard'

import { EmbedActionsContainer, EmbedContainer } from './Notes/EmbedContainer'

export function LinkUnfurlRenderer(props: NodeViewWrapperProps) {
  const href = props.node.attrs.href
  const editable = !!props.editor.options.editable

  return (
    <EmbedContainer draggable selected={props.selected} editor={props.editor}>
      <RichLinkCard
        url={href}
        className={cn('not-prose my-2 max-w-full', { 'pointer-cursor': editable })}
        display='slim'
      />

      {editable && (
        <EmbedActionsContainer>
          <Button
            onClick={() => {
              const editor = props.editor as Editor
              const state = editor.view.state
              const insertTr = editor.view.state.tr
                .insertText(href, state.selection.from, state.selection.to)
                .addMark(
                  state.selection.from,
                  state.selection.to + href.length,
                  editor.schema.marks.link.create({ href })
                )
              const transaction = insertTr
                .setSelection(TextSelection.near(insertTr.doc.resolve(props.getPos() + href.length + 1)))
                .scrollIntoView()

              editor.view.dispatch(transaction)
            }}
            variant='plain'
            iconOnly={<EyeHideIcon size={20} />}
            contentEditable={false}
            accessibilityLabel='Remove link preview'
            tooltip='Remove link preview'
          />
          <Button
            onClick={() => props.deleteNode()}
            variant='plain'
            iconOnly={<TrashIcon size={20} />}
            contentEditable={false}
            accessibilityLabel='Delete preview'
            tooltip='Delete preview'
          />
        </EmbedActionsContainer>
      )}
    </EmbedContainer>
  )
}
