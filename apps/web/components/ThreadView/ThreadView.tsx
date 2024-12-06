import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { ScopeProvider } from 'jotai-scope'
import { isMobile } from 'react-device-detect'
import { useInView } from 'react-intersection-observer'

import { Message } from '@campsite/types'
import { ChatBubbleIcon, LoadingSpinner } from '@campsite/ui'
import { cn } from '@campsite/ui/src/utils'

import { EMPTY_HTML } from '@/atoms/markdown'
import {
  attachmentsAtom,
  chatThreadPlacementAtom,
  clearRepliesAtom,
  editModeAtom,
  inReplyToAtom
} from '@/components/Chat/atoms'
import { EmptyState } from '@/components/EmptyState'
import { FullPageLoading } from '@/components/FullPageLoading'
import { useAppFocused } from '@/hooks/useAppFocused'
import { useCreateMessage } from '@/hooks/useCreateMessage'
import { useEditMessage } from '@/hooks/useEditMessage'
import { useGetMessages } from '@/hooks/useGetMessages'
import { useGetThread } from '@/hooks/useGetThread'
import { useMarkThreadRead } from '@/hooks/useMarkThreadRead'
import { useScrollToBottom } from '@/hooks/useScrollToBottom'
import { useStoredState } from '@/hooks/useStoredState'
import { useUploadChatAttachments } from '@/hooks/useUploadChatAttachments'
import { flattenInfiniteData } from '@/utils/flattenInfiniteData'
import { HydrateAtoms } from '@/utils/jotai'
import { getImmediateScrollableNode, scrollImmediateScrollableNodeToBottom } from '@/utils/scroll'

import { Composer } from '../Thread/Composer'
import { Messages } from '../Thread/Messages'
import { StartOfThread } from '../Thread/StartOfThread'
import { UnseenMessagesButton } from '../Thread/UnseenMessagesButton'
import { DeactivatedMemberThreadComposer } from './DeactivatedMemberThreadComposer'

export function ThreadView({
  threadId,
  placement = undefined
}: {
  threadId: string
  placement?: 'hovercard' | undefined
}) {
  return (
    <ScopeProvider atoms={[inReplyToAtom, attachmentsAtom, editModeAtom, chatThreadPlacementAtom]}>
      <HydrateAtoms atomValues={[[chatThreadPlacementAtom, placement]]}>
        <InnerThreadView threadId={threadId} />
      </HydrateAtoms>
    </ScopeProvider>
  )
}

function InnerThreadView({ threadId }: { threadId: string }) {
  const { data: thread, isLoading, isError, error } = useGetThread({ threadId })
  const messagesQuery = useGetMessages({ threadId: thread?.id })
  const threadPlacement = useAtomValue(chatThreadPlacementAtom)
  const [editMode, setEditMode] = useAtom(editModeAtom)
  const [inReplyTo, setInReplyTo] = useAtom(inReplyToAtom)
  const clearReplies = useSetAtom(clearRepliesAtom)
  const attachments = useAtomValue(attachmentsAtom)
  const [hasNewMessages, setHasNewMessages] = useState(false)
  const { onPaste, onUpload, dropzone } = useUploadChatAttachments({
    enabled: !editMode
  })

  const isFocused = useAppFocused()
  const editMessage = useEditMessage()
  const createMessage = useCreateMessage()
  const { mutate: markThreadRead } = useMarkThreadRead()

  const didSetInitialReplyTo = useRef(false)
  const [replyToId, setReplyToId] = useStoredState(['thread', thread?.id ?? '', 'composer', 'in-reply-to'], '')

  const composerRef = useRef<HTMLFormElement>(null)
  const scrollableRef = useRef<HTMLDivElement>(null)

  const {
    data: messageData,
    isError: isMessagesError,
    isLoading: isMessagesLoading,
    isFetching: isMessagesFetching,
    hasNextPage: hasMessagesNextPage,
    isFetchingNextPage: isMessagesFetchingNextPage,
    fetchNextPage: messagesFetchNextPage
  } = useGetMessages({ threadId })
  const messages = useMemo(() => flattenInfiniteData(messageData)?.reverse() || [], [messageData])
  const [startRef] = useInView({
    skip: isMessagesError || isMessagesFetching || isMessagesFetchingNextPage || !hasMessagesNextPage,
    onChange: (startInView) => {
      if (!startInView) return

      messagesFetchNextPage()
    }
  })
  const [endRef, endInView] = useInView()

  useEffect(() => {
    if (thread && replyToId && messagesQuery.isSuccess && !didSetInitialReplyTo.current) {
      didSetInitialReplyTo.current = true

      const message =
        messagesQuery.data?.pages.flatMap((page) => page.data).find((message) => message.id === replyToId) ?? null

      setInReplyTo(message)
    }
  }, [thread, replyToId, messagesQuery.isSuccess, messagesQuery.data, setInReplyTo])

  useEffect(() => setReplyToId(inReplyTo?.id ?? ''), [inReplyTo?.id, setReplyToId])

  // if a user scrolls to the bottom of the view instead of clicking the "new comments" button,
  // the button should also be hidden
  useEffect(() => {
    if (!endInView) return

    setHasNewMessages(false)

    // checking messages.length also triggers this effect when messages change, which marks read when new messages arrive
    if (!threadId || !messages.length || !isFocused || createMessage.isPending) return

    // Delay markThreadRead to avoid clearing unread indicator on accidental peeks
    if (threadPlacement === 'hovercard') {
      const timer = setTimeout(() => {
        if (thread?.viewer_is_thread_member) markThreadRead({ threadId })
      }, 1000)

      return () => clearTimeout(timer)
    } else {
      if (thread?.viewer_is_thread_member) markThreadRead({ threadId })
    }
  }, [
    threadId,
    endInView,
    markThreadRead,
    setHasNewMessages,
    messages.length,
    isFocused,
    createMessage.isPending,
    threadPlacement,
    thread?.viewer_is_thread_member
  ])

  // this keeps the user scrolled to the bottom as new message come in
  useScrollToBottom({
    stickyRef: composerRef,
    scrollElementRef: scrollableRef
  })

  const forceKeyboardFocusPWA = () => {
    window.scrollTo(0, 0)
    composerRef.current?.blur()
  }

  useLayoutEffect(() => {
    document.addEventListener('visibilitychange', forceKeyboardFocusPWA)
    return () => {
      document.removeEventListener('visibilitychange', forceKeyboardFocusPWA)
    }
  }, [])

  const onNewMessage = useCallback((message: Message) => {
    const el = getImmediateScrollableNode(scrollableRef.current)

    if (!el) return
    const mainScrollTop = el.scrollTop
    const commentsScrollHeight = el.scrollHeight
    const viewportHeight = el.clientHeight
    const unseenCommentsWiggleRoom = 150
    const isAtBottom = mainScrollTop + viewportHeight >= commentsScrollHeight - unseenCommentsWiggleRoom

    if (!message.viewer_is_sender && !isAtBottom) {
      setHasNewMessages(true)
    }
  }, [])

  function onMessage(content: string) {
    if (thread && editMode) {
      editMessage.mutate({
        threadId: thread.id,
        messageId: editMode.id,
        content
      })
    } else if (thread) {
      createMessage.mutate({
        threadId,
        content,
        attachments,
        reply_to: inReplyTo?.id
      })
    }

    // always clear replies
    clearReplies()
  }

  function onEditLastMessage() {
    const allMessages = messagesQuery.data?.pages.flatMap((page) => page.data) ?? []
    const lastMessageByViewer = allMessages.find(
      (message) =>
        message.viewer_is_sender && !message.discarded_at && message.content && message.content !== EMPTY_HTML
    )

    if (lastMessageByViewer) {
      setEditMode(lastMessageByViewer)
    }
  }

  if (!threadId) {
    return <EmptyState title='Conversation not found' icon={<ChatBubbleIcon size={44} className='text-quaternary' />} />
  }

  if (isLoading) return <FullPageLoading />

  if (isError) {
    let errorMessage = error.message

    if (error.message === 'Record not found.') {
      errorMessage = 'Conversation not found'
    }

    return <EmptyState title={errorMessage} icon={<ChatBubbleIcon size={44} className='text-quaternary' />} />
  }

  if (!thread) {
    return <EmptyState title='Conversation not found' icon={<ChatBubbleIcon size={44} className='text-quaternary' />} />
  }

  const allMembersAreDeactivated = thread.other_members.length === 0 && thread.deactivated_members.length > 0

  return (
    <div className='flex flex-1 overflow-hidden'>
      <div className='isolate flex max-h-full flex-1 flex-col overflow-hidden' {...dropzone.getRootProps()}>
        {thread && (
          <>
            <div
              ref={scrollableRef}
              className={cn('relative flex flex-1 flex-col overflow-y-auto', {
                'scrollbar-hide': !!threadPlacement // hovercard
              })}
            >
              <div className='flex w-full flex-1 flex-col lg:mx-auto lg:max-w-3xl'>
                <div className='left-0 right-0 -mb-px h-px flex-none' ref={startRef} />

                {hasMessagesNextPage && (
                  <div
                    className={cn('flex flex-1 items-center justify-center py-4', {
                      'opacity-0': isMessagesLoading
                    })}
                  >
                    <LoadingSpinner />
                  </div>
                )}

                <StartOfThread thread={thread} />
                <Messages
                  key={thread?.id}
                  messages={messages}
                  hasNextPage={!!hasMessagesNextPage}
                  thread={thread}
                  onNewMessage={onNewMessage}
                />

                <div className='left-0 right-0 -mt-px h-px flex-none' ref={endRef} />
              </div>
            </div>

            <div className='w-full lg:mx-auto lg:max-w-3xl'>
              {!allMembersAreDeactivated && (
                <Composer
                  key={thread.id}
                  ref={composerRef}
                  thread={thread}
                  onMessage={onMessage}
                  onEditLastMessage={onEditLastMessage}
                  onScrollToBottom={() => {
                    // wait one render tick so that the optimistic comment is rendered first
                    queueMicrotask(() => {
                      if (!scrollableRef.current) return
                      scrollableRef.current.scrollTop = scrollableRef.current.scrollHeight
                    })
                  }}
                  /*
                  On mobile, when the soft keyboard is opened/closed, it can subtly
                  change the viewport height and cause messages to be pushed behind
                  the sticky composer. To avoid this, we can force the view to scroll
                  to the bottom when the composer is focused or blurred; if the user isn't
                  near the bottom and doesn't forceBottom, the scroll will be ignored.
                */
                  onFocus={() => {
                    if (!isMobile) return
                    scrollImmediateScrollableNodeToBottom(scrollableRef.current)
                  }}
                  onBlur={() => {
                    if (!isMobile || !scrollableRef.current) return

                    const isNearBottom =
                      scrollableRef.current.scrollHeight -
                        scrollableRef.current.scrollTop -
                        scrollableRef.current.clientHeight <
                      100

                    if (isNearBottom) return

                    scrollImmediateScrollableNodeToBottom(scrollableRef.current)
                  }}
                  canSend
                  autoFocus={!threadPlacement}
                  onPaste={onPaste}
                  onUpload={onUpload}
                  dropzone={dropzone}
                >
                  <UnseenMessagesButton
                    active={hasNewMessages}
                    onClick={() => {
                      scrollImmediateScrollableNodeToBottom(scrollableRef.current)
                    }}
                  />
                </Composer>
              )}

              {allMembersAreDeactivated && (
                <DeactivatedMemberThreadComposer plural={thread.deactivated_members.length > 1} />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
