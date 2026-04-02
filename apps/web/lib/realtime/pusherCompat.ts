import { createHmac } from 'crypto'

import { PUSHER_KEY } from '@campsite/config'

type PusherChannelKind = 'presence' | 'private'

function getPusherSecret() {
  return process.env.PUSHER_SECRET || process.env.PUSHER_APP_SECRET || null
}

function getPusherKey() {
  return process.env.PUSHER_KEY || process.env.NEXT_PUBLIC_PUSHER_KEY || PUSHER_KEY || null
}

export function isPusherConfigured() {
  return !!getPusherSecret() && !!getPusherKey()
}

function detectChannelKind(channelName: string): PusherChannelKind {
  return channelName.startsWith('presence-') ? 'presence' : 'private'
}

export function buildPusherAuthPayload(params: {
  channelName: string
  socketId: string
  userId?: string | null
  userName?: string | null
}) {
  const secret = getPusherSecret()
  const key = getPusherKey()

  if (!secret || !key) {
    throw new Error('realtime_unavailable: Pusher auth is not configured')
  }

  const channelKind = detectChannelKind(params.channelName)
  const channelData =
    channelKind === 'presence'
      ? JSON.stringify({
          user_id: params.userId || 'guest',
          user_info: params.userName
            ? {
                name: params.userName
              }
            : undefined
        })
      : undefined
  const stringToSign = channelData
    ? `${params.socketId}:${params.channelName}:${channelData}`
    : `${params.socketId}:${params.channelName}`
  const signature = createHmac('sha256', secret).update(stringToSign).digest('hex')

  return channelData
    ? {
        auth: `${key}:${signature}`,
        channel_data: channelData
      }
    : {
        auth: `${key}:${signature}`
      }
}
