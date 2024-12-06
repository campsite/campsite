import { useRef } from 'react'

import { cn } from '@campsite/ui/utils'

import { MentionInteractivity } from '@/components/InlinePost/MemberHovercard'

import { NodeHandler } from '.'

export const Mention: NodeHandler = ({ node, children }) => {
  const ref = useRef<HTMLSpanElement>(null)

  if (!node.attrs) return <span>{children}</span>

  return (
    <>
      <MentionInteractivity container={ref} />
      <span
        data-type='mention'
        data-id={node.attrs.id}
        data-label={node.attrs.label}
        data-role={node.attrs.role}
        data-username={node.attrs.username}
        className={cn(
          'text-primary font-semibold [.viewer-chat-prose_&]:text-white',
          node.attrs.role === 'app' ? 'cursor-default' : 'cursor-pointer'
        )}
        ref={ref}
      >
        @{node.attrs.label}
      </span>
    </>
  )
}
