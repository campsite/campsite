import { useCallback, useRef, useState } from 'react'
import { m } from 'framer-motion'
import { isMobile } from 'react-device-detect'
import toast from 'react-hot-toast'

import { Post } from '@campsite/types'
import {
  CopyIcon,
  LayeredHotkeys,
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverPortal,
  ReplyIcon
} from '@campsite/ui'
import { ANIMATION_CONSTANTS } from '@campsite/ui/src/utils'

import { draftKey } from '@/atoms/markdown'
import { quotableHtmlNode, quotableHtmlString, useTextSelection } from '@/hooks/useTextSelection'
import { getImmediateScrollableNode } from '@/utils/scroll'

import { PostCommentComposer } from '../Comments/PostCommentComposer'
import { BubbleMenuButton } from '../EditorBubbleMenu/BubbleMenuButton'

interface AutoBlockquoteReplyProps extends React.PropsWithChildren {
  post: Post
  replyingToCommentId?: string
  enabled?: boolean
  className?: string
}

export function AutoBlockquoteReply({
  post,
  replyingToCommentId,
  enabled = true,
  className,
  children
}: AutoBlockquoteReplyProps) {
  const [element, setElement] = useState<HTMLDivElement | null>(null)

  if (!enabled) {
    return children
  }

  return (
    <div ref={setElement} className={className}>
      <InnerAutoBlockquoteReply post={post} replyingToCommentId={replyingToCommentId} element={element} />
      {children}
    </div>
  )
}

function InnerAutoBlockquoteReply({
  post,
  replyingToCommentId,
  element
}: {
  post: Post
  replyingToCommentId?: string
  element: HTMLElement | null
}) {
  const composerRef = useRef<HTMLDivElement>(null)
  const closestScrollParent = getImmediateScrollableNode(element)
  const [selectionRange, setSelectionRange] = useState<Range | null>(null)
  const [selectionHtml, setSelectionHtml] = useState<string>('')
  const [popoverContent, setPopoverContent] = useState<'menu' | 'composer' | 'closed'>('closed')
  const pendingTextSelectionRef = useRef<NodeJS.Timeout>()
  const selectionRectRef = useRef<{ getBoundingClientRect(): DOMRect } | null>(null)

  const closePopover = useCallback(() => {
    setPopoverContent('closed')
    selectionRectRef.current = null
    setSelectionRange(null)
    setSelectionHtml('')
    clearTimeout(pendingTextSelectionRef.current)
  }, [])

  const onTextSelected = useCallback((range: Range) => {
    selectionRectRef.current = range
    setSelectionRange(range)
    clearTimeout(pendingTextSelectionRef.current)
    pendingTextSelectionRef.current = setTimeout(() => setPopoverContent('menu'), 100)
  }, [])
  const onTextUnselected = useCallback(() => {
    // text is unselected when the composer is shown. ignore those events.
    if (popoverContent !== 'composer') {
      closePopover()
    }
  }, [closePopover, popoverContent])

  const onReply = () => {
    if (!selectionRange) return

    setSelectionHtml(quotableHtmlString(selectionRange))
    setPopoverContent('composer')
  }

  useTextSelection({
    container: element,
    onTextSelected,
    onTextUnselected
  })

  const anchor = <PopoverAnchor virtualRef={selectionRectRef} />

  return (
    <>
      <LayeredHotkeys keys='r' callback={() => onReply()} options={{ preventDefault: true }} />

      <Popover open={popoverContent === 'menu' && selectionRange !== null}>
        {anchor}
        <PopoverPortal>
          <PopoverContent
            side={isMobile ? 'bottom' : 'top'}
            align='center'
            sideOffset={15}
            collisionBoundary={closestScrollParent}
            forceMount
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            {selectionRange && (
              <div className='text-primary dark flex gap-1 rounded-lg bg-black p-1 shadow-lg dark:bg-neutral-700'>
                <BubbleMenuButton
                  icon={<ReplyIcon />}
                  tooltip='Reply'
                  shortcut='R'
                  onClick={() => onReply()}
                  title='Reply'
                />

                {!isMobile && (
                  <BubbleMenuButton
                    icon={<CopyIcon />}
                    onClick={() => {
                      const selectedHtml = quotableHtmlString(selectionRange)

                      if (navigator.clipboard && navigator.clipboard.write) {
                        const selectedText = quotableHtmlNode(selectionRange).textContent ?? selectionRange.toString()

                        navigator.clipboard.write([
                          new ClipboardItem({
                            'text/html': new Blob([selectedHtml], { type: 'text/html' }),
                            'text/plain': new Blob([selectedText], { type: 'text/plain' })
                          })
                        ])
                      } else {
                        // Fallback for browsers that don't support navigator.clipboard.write
                        const tempElement = document.createElement('div')

                        tempElement.innerHTML = selectedHtml
                        document.body.appendChild(tempElement)

                        const selection = window.getSelection()
                        const range = document.createRange()

                        range.selectNodeContents(tempElement)
                        selection?.removeAllRanges()
                        selection?.addRange(range)

                        document.execCommand('copy')
                        document.body.removeChild(tempElement)
                      }

                      toast('Copied to clipboard')
                      closePopover()
                    }}
                    title='Copy'
                  />
                )}
              </div>
            )}
          </PopoverContent>
        </PopoverPortal>
      </Popover>

      <Popover
        modal
        open={popoverContent === 'composer'}
        onOpenChange={(open) => {
          if (!open) {
            closePopover()
          }
        }}
      >
        {anchor}
        {popoverContent === 'composer' && (
          <PopoverPortal>
            <PopoverContent align='center' collisionBoundary={closestScrollParent} forceMount>
              <m.div {...ANIMATION_CONSTANTS}>
                <div
                  className='bg-elevated flex w-[500px] max-w-[--radix-popover-content-available-width] origin-[--radix-popover-content-transform-origin] flex-col rounded-xl shadow-lg shadow-black/20 ring-1 ring-black/[0.04] dark:shadow-[inset_0px_1px_0px_rgba(255,255,255,0.04),_0px_2px_12px_rgba(0,0,0,0.4),_0px_0px_0px_1px_rgba(0,0,0,0.8)] dark:ring-white/[0.02]'
                  ref={composerRef}
                >
                  <PostCommentComposer
                    autoFocus='end'
                    display='inline'
                    postId={post.id}
                    replyingToCommentId={replyingToCommentId}
                    onSubmitting={() => {
                      closePopover()
                      toast('Comment posted')
                    }}
                    closeComposer={closePopover}
                    draftKeyOverride={
                      draftKey({
                        postId: post.id,
                        replyingToCommentId
                      }) + selectionHtml.replace(/\s/g, '.')
                    }
                    maxHeight='120px'
                    initialValues={{
                      body_html: `<blockquote>${selectionHtml}</blockquote><p></p>`
                    }}
                  />
                </div>
              </m.div>
            </PopoverContent>
          </PopoverPortal>
        )}
      </Popover>
    </>
  )
}
