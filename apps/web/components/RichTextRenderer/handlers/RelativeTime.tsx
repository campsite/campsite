import { NodeViewWrapper, NodeViewWrapperProps } from '@tiptap/react'

import { cn } from '@campsite/ui/src/utils'
import { Tooltip } from '@campsite/ui/Tooltip'

import { useRerenderNodeViewOnBlur } from '@/components/Post/Notes/useRerenderNodeViewOnBlur'

import { NodeHandler } from '.'

export function RelativeTimeView({ timestamp, originalTz }: { timestamp: string; originalTz: string }) {
  const date = new Date(timestamp)
  const displayTime = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }).toLowerCase().replace(' ', '')
  const originalTime = date
    .toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', timeZoneName: 'long', timeZone: originalTz })
    .replace(/ (AM|PM)/, (_match, p1) => p1.toLowerCase())

  return (
    <Tooltip label={originalTime}>
      <span
        className={cn(
          'cursor-default rounded bg-black/[0.04] decoration-clone px-[3px] py-0.5 align-baseline font-medium hover:bg-black/[0.08] dark:bg-white/10 dark:hover:bg-white/[0.14]',
          '[.viewer-chat-prose_&]:bg-white/15 [.viewer-chat-prose_&]:text-white [.viewer-chat-prose_&]:hover:bg-white/25'
        )}
      >
        {displayTime}
      </span>
    </Tooltip>
  )
}

export const RelativeTime: NodeHandler<{ timestamp?: string }> = (props) => {
  if (!props.node.attrs?.timestamp || !props.node.attrs?.originalTz) {
    return null
  }

  return <RelativeTimeView timestamp={props.node.attrs.timestamp} originalTz={props.node.attrs.originalTz} />
}

export function InlineRelativeTimeRenderer(props: NodeViewWrapperProps) {
  const editor = props.editor

  useRerenderNodeViewOnBlur(editor)

  return (
    <NodeViewWrapper
      as='span'
      className={cn(
        'rounded',
        {
          '-focus-visible:outline-offset-1 outline outline-2 outline-blue-500 focus-visible:outline-2 focus-visible:outline-blue-500':
            props.editor.options.editable && props.selected && props.editor.isFocused
        },
        '[.drag-node_&]:outline-none'
      )}
      draggable={false}
      data-drag-handle={false}
    >
      <RelativeTimeView timestamp={props.node.attrs.timestamp} originalTz={props.node.attrs.originalTz} />
    </NodeViewWrapper>
  )
}
