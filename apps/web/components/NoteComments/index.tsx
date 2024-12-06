import { useMemo, useRef } from 'react'

import { Comment, Note, TimelineEvent } from '@campsite/types'
import { Button, ChatBubbleIcon } from '@campsite/ui'

import { NoteCommentComposer } from '@/components/Comments/NoteCommentComposer'
import { useGetNoteAttachmentComments } from '@/hooks/useGetNoteAttachmentComments'
import { useGetNoteComments } from '@/hooks/useGetNoteComments'
import { useGetNoteTimelineEvents } from '@/hooks/useGetNoteTimelineEvents'
import { flattenInfiniteData } from '@/utils/flattenInfiniteData'
import { scrollImmediateScrollableNodeToBottom } from '@/utils/scroll'

import { CommentListHeader } from '../Comments/CommentListHeader'
import { EmptyState } from '../EmptyState'
import { CommentsList } from './CommentsList'

interface Props {
  note: Note
}

export function NoteComments({ note }: Props) {
  const {
    data: commentsData,
    isFetching: isFetchingComments,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage
  } = useGetNoteComments({ noteId: note.id })
  const { data: timelineEventsData, isFetching: isFetchingTimelineEvents } = useGetNoteTimelineEvents({
    noteId: note.id
  })
  const comments = useMemo(() => flattenInfiniteData(commentsData) || [], [commentsData])
  const timelineEvents = useMemo(() => flattenInfiniteData(timelineEventsData) ?? [], [timelineEventsData])

  return (
    <InnerNoteComments
      note={note}
      comments={comments}
      timelineEvents={timelineEvents}
      isFetching={isFetchingComments || isFetchingTimelineEvents}
      isFetchingNextPage={isFetchingNextPage}
      hasNextPage={!!hasNextPage}
      fetchNextPage={fetchNextPage}
    />
  )
}

interface AttachmentProps {
  note: Note
  attachmentId: string
  onSidebarOpenChange?(open: boolean): void
  hideAttachment?: boolean
}

export function NoteAttachmentComments({ note, attachmentId, onSidebarOpenChange, hideAttachment }: AttachmentProps) {
  const { data, isFetching, isFetchingNextPage, hasNextPage, fetchNextPage } = useGetNoteAttachmentComments({
    noteId: note.id,
    attachmentId
  })
  const comments = useMemo(() => flattenInfiniteData(data) || [], [data])

  return (
    <InnerNoteComments
      note={note}
      comments={comments}
      timelineEvents={[]}
      attachmentId={attachmentId}
      isFetching={isFetching}
      isFetchingNextPage={isFetchingNextPage}
      hasNextPage={!!hasNextPage}
      fetchNextPage={fetchNextPage}
      onSidebarOpenChange={onSidebarOpenChange}
      hideAttachment={hideAttachment}
    />
  )
}

interface InnerProps {
  note: Note
  comments: Comment[]
  timelineEvents: TimelineEvent[]
  attachmentId?: string
  isFetching: boolean
  isFetchingNextPage: boolean
  hasNextPage: boolean
  fetchNextPage: () => void
  onSidebarOpenChange?(open: boolean): void
  hideAttachment?: boolean
}

function InnerNoteComments({
  note,
  comments,
  timelineEvents,
  attachmentId,
  isFetching,
  isFetchingNextPage,
  hasNextPage,
  fetchNextPage,
  onSidebarOpenChange,
  hideAttachment
}: InnerProps) {
  const hasAnyComments = comments.length > 0 || timelineEvents.length > 0
  const endOfCommentsRef = useRef<HTMLDivElement>(null)

  function onCommentCreated() {
    // wait one render tick so that the optimistic comment is rendered first
    queueMicrotask(() => {
      scrollImmediateScrollableNodeToBottom(endOfCommentsRef.current)
    })
  }

  return (
    <>
      <div className='relative flex w-full flex-1 flex-col gap-3 overflow-y-auto px-3 pt-3 transition-all lg:max-h-full'>
        <div className='px-1'>
          <CommentListHeader />
        </div>

        {!hasAnyComments && <EmptyState icon={<ChatBubbleIcon size={40} className='text-quaternary' />} />}
        {hasAnyComments && (
          <>
            <div className='relative flex flex-1 flex-col gap-6'>
              {hasNextPage && (
                <Button variant='flat' disabled={isFetching || isFetchingNextPage} onClick={() => fetchNextPage()}>
                  Show previous comments
                </Button>
              )}

              {!hasAnyComments && <EmptyState />}

              <CommentsList
                note={note}
                timelineEvents={timelineEvents}
                comments={comments}
                onSidebarOpenChange={onSidebarOpenChange}
                hideAttachment={hideAttachment}
              />
            </div>
          </>
        )}
        <div ref={endOfCommentsRef} className='h-px w-full flex-none' />
      </div>

      <div className='pb-safe-offset-3 w-full border-t p-3 transition-all lg:sticky lg:bottom-0'>
        <NoteCommentComposer
          noteId={note.id}
          attachmentId={attachmentId}
          autoFocus={false}
          onCreated={onCommentCreated}
        />
      </div>
    </>
  )
}
