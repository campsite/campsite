import { NextResponse } from 'next/server'

import { api } from '@/convex/_generated/api'
import { routeErrorResponse } from '@/lib/routeErrors'
import { getConvexServerClient } from '@/lib/convex/server'
import { isValidHmsWebhookPasscode } from '@/lib/calls/hmsCompat'

interface HmsEventPayload {
  type?: string
  data?: Record<string, unknown>
}

function parseTimestamp(value: unknown) {
  if (typeof value !== 'string') {
    return null
  }

  const timestamp = Date.parse(value)

  return Number.isNaN(timestamp) ? null : timestamp
}

function unprocessable(message: string) {
  return NextResponse.json({ message }, { status: 422 })
}

export async function POST(request: Request) {
  if (!isValidHmsWebhookPasscode(request.headers.get('x-passcode'))) {
    return unprocessable('unrecognized passcode')
  }

  const payload = (await request.json().catch(() => null)) as HmsEventPayload | null

  if (!payload?.type || !payload.data) {
    return unprocessable('invalid HMS event payload')
  }

  const client = getConvexServerClient()

  try {
    switch (payload.type) {
      case 'session.open.success': {
        const remoteRoomId = typeof payload.data.room_id === 'string' ? payload.data.room_id : null
        const remoteSessionId = typeof payload.data.session_id === 'string' ? payload.data.session_id : null
        const sessionStartedAt = parseTimestamp(payload.data.session_started_at) ?? Date.now()

        if (remoteRoomId && remoteSessionId) {
          await client.mutation(api.callsRealtime.syncLegacyCallFromHmsSessionOpen, {
            remoteRoomId,
            remoteSessionId,
            sessionStartedAt
          })
        }

        break
      }
      case 'session.close.success': {
        const remoteRoomId = typeof payload.data.room_id === 'string' ? payload.data.room_id : null
        const remoteSessionId = typeof payload.data.session_id === 'string' ? payload.data.session_id : null
        const sessionStartedAt = parseTimestamp(payload.data.session_started_at) ?? Date.now()
        const sessionStoppedAt = parseTimestamp(payload.data.session_stopped_at) ?? Date.now()

        if (remoteRoomId && remoteSessionId) {
          await client.mutation(api.callsRealtime.syncLegacyCallFromHmsSessionClose, {
            remoteRoomId,
            remoteSessionId,
            sessionStartedAt,
            sessionStoppedAt
          })
        }

        break
      }
      case 'beam.recording.success': {
        const remoteSessionId = typeof payload.data.session_id === 'string' ? payload.data.session_id : null
        const duration = typeof payload.data.duration === 'number' ? payload.data.duration : null
        const remoteRecordingId = typeof payload.data.recording_id === 'string' ? payload.data.recording_id : undefined
        const remoteBeamId = typeof payload.data.beam_id === 'string' ? payload.data.beam_id : undefined
        const recordingPath = typeof payload.data.recording_path === 'string' ? payload.data.recording_path : undefined
        const chatRecordingPath =
          typeof payload.data.chat_recording_path === 'string' ? payload.data.chat_recording_path : undefined
        const startedAt = parseTimestamp(payload.data.started_at) ?? undefined
        const stoppedAt = parseTimestamp(payload.data.stopped_at) ?? undefined

        if (remoteSessionId) {
          await client.mutation(api.callsRealtime.syncLegacyCallRecordingFromHmsEvent, {
            remoteSessionId,
            remoteRecordingId,
            remoteBeamId,
            recordingPath,
            chatRecordingPath,
            duration: duration ?? undefined,
            startedAt,
            stoppedAt
          })
        }

        if (remoteSessionId && duration !== null) {
          await client.mutation(api.callsRealtime.syncLegacyCallRecordingDurationFromHmsEvent, {
            remoteSessionId,
            duration
          })
        }

        break
      }
      case 'transcription.started.success': {
        const remoteRecordingId = typeof payload.data.recording_id === 'string' ? payload.data.recording_id : undefined
        const remoteTranscriptionId =
          typeof payload.data.transcription_id === 'string' ? payload.data.transcription_id : null
        const startedAt = parseTimestamp(payload.data.started_at) ?? Date.now()

        if (remoteTranscriptionId) {
          await client.mutation(api.callsRealtime.syncLegacyCallTranscriptionStartedFromHmsEvent, {
            remoteRecordingId,
            remoteTranscriptionId,
            startedAt
          })
        }

        break
      }
      case 'transcription.success': {
        const remoteRecordingId = typeof payload.data.recording_id === 'string' ? payload.data.recording_id : undefined
        const remoteTranscriptionId =
          typeof payload.data.transcription_id === 'string' ? payload.data.transcription_id : undefined
        const transcriptJsonPath =
          typeof payload.data.transcript_json_path === 'string' ? payload.data.transcript_json_path : undefined
        const transcriptSrtPath =
          typeof payload.data.transcript_srt_path === 'string' ? payload.data.transcript_srt_path : undefined
        const transcriptTxtPath =
          typeof payload.data.transcript_txt_path === 'string' ? payload.data.transcript_txt_path : undefined
        const transcriptionVtt =
          typeof payload.data.transcription_vtt === 'string'
            ? payload.data.transcription_vtt
            : typeof payload.data.vtt === 'string'
              ? payload.data.vtt
              : undefined
        const succeededAt = parseTimestamp(payload.data.succeeded_at) ?? Date.now()

        await client.mutation(api.callsRealtime.syncLegacyCallTranscriptionFromHmsEvent, {
          remoteRecordingId,
          remoteTranscriptionId,
          transcriptJsonPath,
          transcriptSrtPath,
          transcriptTxtPath,
          transcriptionVtt,
          succeededAt
        })

        break
      }
      case 'transcription.failure': {
        const remoteRecordingId = typeof payload.data.recording_id === 'string' ? payload.data.recording_id : undefined
        const remoteTranscriptionId =
          typeof payload.data.transcription_id === 'string' ? payload.data.transcription_id : null
        const failedAt = parseTimestamp(payload.data.failed_at) ?? Date.now()

        if (remoteTranscriptionId) {
          await client.mutation(api.callsRealtime.syncLegacyCallTranscriptionFailureFromHmsEvent, {
            remoteRecordingId,
            remoteTranscriptionId,
            failedAt
          })
        }

        break
      }
      default:
        break
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    return routeErrorResponse(error)
  }
}
