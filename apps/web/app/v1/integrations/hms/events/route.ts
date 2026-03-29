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

        if (remoteSessionId && duration !== null) {
          await client.mutation(api.callsRealtime.syncLegacyCallRecordingDurationFromHmsEvent, {
            remoteSessionId,
            duration
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
