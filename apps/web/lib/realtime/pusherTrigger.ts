import { createHash, createHmac } from 'crypto'

import { PUSHER_APP_CLUSTER, PUSHER_KEY } from '@campsite/config'

function getPusherSecret() {
  return process.env.PUSHER_SECRET || process.env.PUSHER_APP_SECRET || null
}

function getPusherAppId() {
  return process.env.PUSHER_APP_ID || null
}

export async function triggerPusherEvent(channel: string, event: string, data: unknown) {
  const appId = getPusherAppId()
  const key = PUSHER_KEY
  const secret = getPusherSecret()
  const cluster = PUSHER_APP_CLUSTER || 'eu'

  if (!appId || !key || !secret) {
    return
  }

  const body = JSON.stringify({ name: event, channel, data: JSON.stringify(data) })
  const bodyMd5 = createHash('md5').update(body).digest('hex')
  const timestamp = Math.floor(Date.now() / 1000).toString()
  const path = `/apps/${appId}/events`

  const params = [
    `auth_key=${key}`,
    `auth_timestamp=${timestamp}`,
    `auth_version=1.0`,
    `body_md5=${bodyMd5}`
  ].join('&')

  const stringToSign = `POST\n${path}\n${params}`
  const signature = createHmac('sha256', secret).update(stringToSign).digest('hex')

  const url = `https://api-${cluster}.pusher.com${path}?${params}&auth_signature=${signature}`

  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body
  })
}

export async function triggerPusherEvents(events: Array<{ channel: string; event: string; data: unknown }>) {
  await Promise.all(events.map((e) => triggerPusherEvent(e.channel, e.event, e.data)))
}
