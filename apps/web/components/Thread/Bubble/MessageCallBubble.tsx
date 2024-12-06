import { Message, MessageCall, MessageThread } from '@campsite/types'
import { Button, PaperAirplaneIcon, PlayIcon, Tooltip, UIText, VideoCameraFilledIcon } from '@campsite/ui'
import { cn } from '@campsite/ui/src/utils'

import { useGetCallPeerMembers } from '@/components/Calls/useGetCallPeerUsers'
import { CallSharePopover } from '@/components/CallSharePopover'
import { FacePile } from '@/components/FacePile'
import { HTMLRenderer } from '@/components/HTMLRenderer'
import { useScope } from '@/contexts/scope'
import { useGetCall } from '@/hooks/useGetCall'
import { useJoinMessageThreadCall } from '@/hooks/useJoinMessageThreadCall'
import { longTimestamp } from '@/utils/timestamp'

interface MessageCallBubbleProps {
  thread: MessageThread
  call: MessageCall
  message: Message
  className: string
}

export function MessageCallBubble({ thread, call, message, className }: MessageCallBubbleProps) {
  return call.active ? (
    <ActiveMessageCall message={message} thread={thread} call={call} className={className} />
  ) : (
    <CompletedMessageCall message={message} call={call} className={className} />
  )
}

function ActiveMessageCall({
  thread,
  call,
  message,
  className
}: {
  thread: MessageThread
  call: MessageCall
  message: Message
  className: string
}) {
  const { joinCall, canJoin } = useJoinMessageThreadCall({ thread })

  const activeCallMembers = useGetCallPeerMembers({ peers: call.peers, activeOnly: true })
  const activeCallUsers = activeCallMembers.map((member) => member.user)
  const showJoinButton = message.viewer_is_sender ? canJoin && activeCallMembers.length > 0 : canJoin

  return (
    <button
      onClick={() => joinCall()}
      className={cn(
        'bg-primary dark:bg-elevated dark relative flex w-full max-w-sm flex-1 items-center p-3 text-left',
        className
      )}
      disabled={!canJoin}
    >
      <Tooltip
        align={message.viewer_is_sender ? 'end' : 'start'}
        label={longTimestamp(message.created_at, { month: 'short' })}
      >
        <div className='absolute inset-0 z-0' />
      </Tooltip>

      <div className='rounded-full bg-green-500 p-2'>
        <VideoCameraFilledIcon size={24} />
      </div>

      <UIText weight='font-semibold' className='ml-3 line-clamp-1 flex-1'>
        Started a call
      </UIText>

      <FacePile users={activeCallUsers} size='sm' />

      {showJoinButton && (
        <Button
          variant='plain'
          round
          className='ml-3 bg-green-500 text-white hover:bg-green-400 dark:hover:bg-green-500'
        >
          Join
        </Button>
      )}
    </button>
  )
}

function CompletedMessageCall({
  message,
  call,
  className
}: {
  message: Message
  call: MessageCall
  className: string
}) {
  const callPeers = useGetCallPeerMembers({ peers: call.peers })
  const callPeersUsers = callPeers.map((member) => member.user)

  const isProcessing = call.recordings.some(
    (recording) => recording.transcription_status === 'NOT_STARTED' || recording.transcription_status === 'IN_PROGRESS'
  )

  return (
    <>
      <div className={cn('bg-primary dark:bg-elevated dark relative flex w-full max-w-sm flex-col p-3', className)}>
        <Tooltip
          align={message.viewer_is_sender ? 'end' : 'start'}
          label={longTimestamp(message.created_at, { month: 'short' })}
        >
          <div className='absolute inset-0 z-0' />
        </Tooltip>

        <div className='grid grid-cols-[40px,1fr] items-center gap-3'>
          <div className='bg-quaternary rounded-full p-2'>
            <VideoCameraFilledIcon size={24} />
          </div>

          <div className='flex w-full flex-col items-start gap-2'>
            <div className='flex w-full flex-1 items-center gap-3'>
              <UIText weight='font-semibold' className='line-clamp-1 break-all'>
                Call ended
              </UIText>
              <UIText tertiary>{call.duration}</UIText>

              <div className='flex flex-1 justify-end'>
                <FacePile users={callPeersUsers} size='sm' />
              </div>
            </div>
          </div>
        </div>

        {!!call.recordings.length && (
          <div className='mt-2 grid grid-cols-[40px,1fr] gap-3'>
            <div className='col-start-2 flex flex-col gap-1'>
              {call.summary_html && (
                <HTMLRenderer
                  className='text-tertiary break-anywhere -mt-2 mb-2 line-clamp-2 text-sm'
                  text={call.summary_html}
                />
              )}
              <div className='flex items-center gap-2'>
                <RecordingStatus call={call} />
                {!isProcessing && <ShareCallButton callId={call.id} />}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

function ShareCallButton({ callId }: { callId: string }) {
  const { data: call } = useGetCall({ id: callId })

  if (!call) return null

  return (
    <CallSharePopover call={call}>
      <Button
        iconOnly={<PaperAirplaneIcon />}
        variant='flat'
        round
        accessibilityLabel='Share call'
        className='dark:hover:bg-quaternary'
      />
    </CallSharePopover>
  )
}

function RecordingStatus({ call }: { call: MessageCall }) {
  const { recordings } = call
  const { scope } = useScope()

  const isProcessing = recordings.some(
    (recording) => recording.transcription_status === 'NOT_STARTED' || recording.transcription_status === 'IN_PROGRESS'
  )

  return (
    <>
      <Button
        disabled={isProcessing}
        fullWidth
        leftSlot={<PlayIcon />}
        variant='flat'
        href={`/${scope}/calls/${call.id}`}
        className='dark:hover:bg-quaternary flex-1'
        round
      >
        Watch
      </Button>
    </>
  )
}
