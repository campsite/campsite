import { useRef } from 'react'
import Router from 'next/router'

import { WEB_URL } from '@campsite/config/index'
import { openBlank } from '@campsite/ui/Link'
import { cn } from '@campsite/ui/src/utils'

import { DisplayType } from '@/components/InlinePost'
import { PostLink } from '@/components/Post/PostLink'
import { useScope } from '@/contexts/scope'

interface InlinePostContainerProps {
  postId: string
  display?: DisplayType
  className?: string
  children?: React.ReactNode
  interactive?: boolean
  onClick?: Function
  linkable?: boolean
}

export function InlinePostContainer({
  postId,
  display,
  children,
  linkable = true,
  interactive = true,
  className,
  onClick
}: InlinePostContainerProps) {
  const { scope } = useScope()
  const containerRef = useRef<HTMLDivElement>(null)

  return (
    <div
      ref={containerRef}
      onClickCapture={(evt) => {
        onClick?.()

        if (display === 'page') return
        if (!interactive) return

        const didClickInPortal =
          containerRef.current !== evt.target &&
          evt.target instanceof Element &&
          !containerRef.current?.contains(evt.target)

        const interactiveElements = ['button', 'a', 'form', 'input', 'video', 'img', '.tweet']
        const didClickInteractiveElement = interactiveElements.some(
          (el) => evt.target instanceof Element && !!evt.target.closest(el)
        )

        const didSelectText = !!window.getSelection()?.toString()?.length

        if (didClickInPortal || didClickInteractiveElement || didSelectText) return

        evt.stopPropagation()

        if (evt.metaKey || evt.ctrlKey) {
          openBlank(`${WEB_URL}/${scope}/posts/${postId}`)
        } else {
          Router.push(`/${scope}/posts/${postId}`)
        }
      }}
      className={cn('relative isolate', className)}
    >
      {linkable && (
        <PostLink
          postId={postId}
          className={cn({
            'sr-only': interactive,
            'after:absolute after:inset-0 after:z-[1]': !interactive
          })}
        >
          {interactive && 'View post'}
        </PostLink>
      )}

      {children}
    </div>
  )
}
