import { api } from '@/convex/_generated/api'
import { getConvexServerClient } from '@/lib/convex/server'

export function getCallsCompatClient(accessToken: string) {
  const client = getConvexServerClient(accessToken)

  return {
    promoteCompatCalls: (data: { slug: string }) => client.mutation(api.callsRealtime.promoteLegacyCallsCompat, data),
    getCallsPage: (data: { slug: string; filter?: string; after?: string; limit?: number; q?: string }) =>
      client.query(api.callsRealtime.getLegacyCallsCompatPage, data),
    getCallById: (data: { slug: string; callId: string }) => client.query(api.callsRealtime.getLegacyCallCompatById, data),
    updateCall: (data: { slug: string; callId: string; title?: string | null; summaryHtml?: string | null }) =>
      client.mutation(api.callsRealtime.updateLegacyCallCompat, data),
    getRecordingsPage: (data: { slug: string; callId: string; after?: string; limit?: number }) =>
      client.query(api.callsRealtime.getLegacyCallCompatRecordingsPage, data),
    getRecordingTranscription: (data: { slug: string; callRecordingId: string }) =>
      client.query(api.callsRealtime.getLegacyCallRecordingTranscription, data),
    deleteAllRecordings: (data: { slug: string; callId: string }) =>
      client.mutation(api.callsRealtime.deleteLegacyCallCompatRecordings, data),
    createPin: (data: { slug: string; callId: string }) => client.mutation(api.callsRealtime.createLegacyCallCompatPin, data),
    createFollowUp: (data: { slug: string; callId: string; showAt: number }) =>
      client.mutation(api.callsRealtime.createLegacyCallCompatFollowUp, data),
    updateProjectPermission: (data: {
      slug: string
      callId: string
      projectId: string
      permission: 'view' | 'edit'
    }) => client.mutation(api.callsRealtime.updateLegacyCallCompatProjectPermission, data),
    deleteProjectPermission: (data: { slug: string; callId: string }) =>
      client.mutation(api.callsRealtime.deleteLegacyCallCompatProjectPermission, data)
  }
}

export function parseOptionalInteger(value: string | null) {
  if (!value) {
    return undefined
  }

  const parsed = Number(value)

  return Number.isFinite(parsed) ? parsed : undefined
}

export function parseShowAt(value: unknown) {
  if (typeof value !== 'string') {
    throw new Error('unprocessable:show_at is required')
  }

  const timestamp = Date.parse(value)

  if (Number.isNaN(timestamp)) {
    throw new Error('unprocessable:show_at must be a valid ISO datetime')
  }

  return timestamp
}
