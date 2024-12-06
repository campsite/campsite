import { Editor } from '@tiptap/core'
import { NodeViewWrapper } from '@tiptap/react'

import { cn } from '@campsite/ui/src/utils'

import { useRerenderNodeViewOnBlur } from '@/components/Post/Notes/useRerenderNodeViewOnBlur'
import { useCanHover } from '@/hooks/useCanHover'

interface Props {
  children: React.ReactNode
  draggable: boolean
  selected: boolean
  editor: Editor
  className?: string
}

/**
 * A container for inline attachment nodes in TipTap editors that handles interactions like focus, blur, and dragging.
 */
export function EmbedContainer({ children, draggable, selected, editor, className }: Props) {
  useRerenderNodeViewOnBlur(editor)

  return (
    <NodeViewWrapper
      as='div'
      className={cn(
        'group relative rounded',
        {
          'outline outline-2 outline-offset-2 outline-blue-500 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-blue-500':
            editor.options.editable && selected && editor.isFocused
        },
        '[.drag-node_&]:outline-none',
        className
      )}
      draggable={draggable}
      data-drag-handle={draggable}
    >
      {children}
    </NodeViewWrapper>
  )
}

interface EmbedActionsContainerProps {
  children: React.ReactNode
}

export function EmbedActionsContainer({ children }: EmbedActionsContainerProps) {
  const hasHover = useCanHover()

  return (
    <div
      className={cn(
        'bg-elevated dark absolute right-2 top-2 z-[1] rounded opacity-0 transition-opacity duration-100 group-hover:opacity-100',
        'shadow-[inset_0px_1px_0px_rgb(255_255_255_/_0.04),_inset_0px_0px_0px_1px_rgb(255_255_255_/_0.04),_0px_1px_2px_rgb(0_0_0_/_0.12),_0px_2px_4px_rgb(0_0_0_/_0.08),_0px_0px_0px_0.5px_rgb(0_0_0_/_0.24)]',
        !hasHover && 'opacity-100'
      )}
    >
      {children}
    </div>
  )
}
