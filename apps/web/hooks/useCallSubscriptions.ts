import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'

import { Call } from '@campsite/types/generated'

import { useScope } from '@/contexts/scope'
import { useBindChannelEvent } from '@/hooks/useBindChannelEvent'
import { useCallChannel } from '@/hooks/useCallChannel'
import { apiClient } from '@/utils/queryClient'

export function useCallSubscriptions({ call }: { call: Call }) {
  const queryClient = useQueryClient()
  const { scope } = useScope()
  const callChannel = useCallChannel(call)

  const invalidateCallQuery = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: apiClient.organizations.getCallsById().requestKey(`${scope}`, call.id)
    })
  }, [call.id, queryClient, scope])

  const invalidateRecordingQueries = useCallback(
    ({ call_recording_id }: { call_recording_id: string }) => {
      queryClient.invalidateQueries({
        queryKey: apiClient.organizations.getCallsRecordings().requestKey({ orgSlug: `${scope}`, callId: call.id })
      })
      queryClient.invalidateQueries({
        queryKey: apiClient.organizations.getCallRecordingsTranscription().requestKey(`${scope}`, call_recording_id)
      })
    },
    [call.id, queryClient, scope]
  )

  useBindChannelEvent(callChannel, 'call-stale', invalidateCallQuery)
  useBindChannelEvent(callChannel, 'recording-stale', invalidateRecordingQueries)
}
