import { selectRecordingState, useHMSStore } from '@100mslive/react-sdk'

export function useIsRecording() {
  const { state: recordingState } = useHMSStore(selectRecordingState).browser

  return recordingState === 'started' || recordingState === 'resumed'
}
