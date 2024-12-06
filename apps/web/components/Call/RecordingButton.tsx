import { useEffect, useRef, useState } from 'react'
import { HMSNotificationTypes, useHMSActions, useHMSNotifications } from '@100mslive/react-sdk'
import useSound from 'use-sound'

import { Button, LayeredHotkeys, useBreakpoint } from '@campsite/ui'
import { cn } from '@campsite/ui/src/utils'

import { CALL_CHAT_SYSTEM_MESSAGE_TYPE } from '@/components/Call/CallChat'
import { useIsRecording } from '@/hooks/useIsRecording'

const STARTING_RECORDING_MESSAGE =
  'Starting recording. Any links shared while recording will be available in the call summary.'
const STOPPING_RECORDING_MESSAGE = 'Recording stopped.'

export function RecordingButton() {
  const isSm = useBreakpoint('sm')
  const hmsActions = useHMSActions()
  const newMessageNotification = useHMSNotifications(HMSNotificationTypes.NEW_MESSAGE)
  const [localState, setLocalState] = useState<'starting' | 'stopping'>()
  const isStarting = localState === 'starting'
  const isStopping = localState === 'stopping'

  const canToggle = !isStarting && !isStopping
  const isRecording = useIsRecording()
  const [playRecordingStartedSound] = useSound('/sounds/call-recording-start.mp3', { volume: 0.2 })
  const [playRecordingEndedSound] = useSound('/sounds/call-recording-stop.mp3', { volume: 0.2 })

  // store previous recording state so we can look for _changes_ in order to play the sound
  const isRecordingRef = useRef(isRecording)

  useEffect(() => {
    if (newMessageNotification?.data.type !== CALL_CHAT_SYSTEM_MESSAGE_TYPE) return

    // When another user is starting a call, disable the start recording button
    if (newMessageNotification?.data.message === STARTING_RECORDING_MESSAGE) {
      setLocalState('starting')
    }

    // When another user is stopping a call, disable the stop recording button
    if (newMessageNotification?.data.message === STOPPING_RECORDING_MESSAGE) {
      setLocalState('stopping')
    }
  }, [newMessageNotification])

  useEffect(() => {
    if (!isRecording && isRecordingRef.current) playRecordingEndedSound()
    if (isRecording && !isRecordingRef.current) playRecordingStartedSound()

    isRecordingRef.current = isRecording
  }, [isRecording, playRecordingEndedSound, playRecordingStartedSound])

  const label = isRecording
    ? isStopping
      ? 'Stopping recording'
      : 'Stop recording'
    : isStarting
      ? 'Starting recording'
      : 'Start recording'

  useEffect(() => {
    if ((isRecording && localState === 'starting') || (!isRecording && localState === 'stopping')) {
      setLocalState(undefined)
    }
  }, [isRecording, localState])

  const toggleRecording = () => {
    if (!canToggle) return

    if (isRecording) {
      setLocalState('stopping')
      hmsActions.stopRTMPAndRecording().then(() => {
        hmsActions.sendBroadcastMessage(STOPPING_RECORDING_MESSAGE, CALL_CHAT_SYSTEM_MESSAGE_TYPE)
      })
    } else {
      setLocalState('starting')
      hmsActions
        .startRTMPOrRecording({ record: true })
        .catch(() => {
          // We can't know if another peer has already initiated starting/stopping recording.
          // Catch the error thrown when starting/stopping recording when already in progress.
          setLocalState(undefined)
        })
        .then(() => {
          hmsActions.sendBroadcastMessage(STARTING_RECORDING_MESSAGE, CALL_CHAT_SYSTEM_MESSAGE_TYPE)
        })
    }
  }

  const icon = (
    <div className='flex h-5 w-5 items-center justify-center'>
      <div
        className={cn('h-3.5 w-3.5', {
          'rounded-full bg-white': !isRecording,
          'animate-pulse rounded-sm bg-red-500': isRecording
        })}
      />
    </div>
  )

  return (
    <>
      <LayeredHotkeys keys='mod+alt+r' callback={toggleRecording} />

      <Button
        fullWidth={!isSm}
        variant='flat'
        size='large'
        tooltip={label}
        tooltipShortcut='mod+alt+r'
        onClick={toggleRecording}
        className={cn('relative', isRecording && 'bg-red-900 text-red-500 dark:bg-red-950/80 dark:hover:bg-red-950')}
        disabled={!canToggle}
        leftSlot={icon}
      >
        {isRecording ? 'Recording' : isStarting ? 'Starting...' : isStopping ? 'Stopping...' : 'Record call'}
      </Button>
    </>
  )
}
