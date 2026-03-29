import { createHmac, timingSafeEqual } from 'crypto'

const ONE_HOUR_IN_SECONDS = 60 * 60

interface SyncTokenPayload {
  accessToken: string
  exp: number
  iat: number
  type: 'editor-sync'
}

function getSyncTokenSecret() {
  return process.env.SYNC_TOKEN_SECRET || process.env.WORKOS_COOKIE_PASSWORD || null
}

function encodePayload(payload: SyncTokenPayload) {
  return Buffer.from(JSON.stringify(payload)).toString('base64url')
}

function signPayload(payload: string, secret: string) {
  return createHmac('sha256', secret).update(payload).digest('base64url')
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left)
  const rightBuffer = Buffer.from(right)

  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer)
}

export function isEditorSyncConfigured() {
  return !!getSyncTokenSecret()
}

export function createEditorSyncToken(accessToken: string) {
  const secret = getSyncTokenSecret()

  if (!secret) {
    throw new Error('sync_unavailable: Sync token signing is not configured')
  }

  const issuedAt = Math.floor(Date.now() / 1000)
  const payload = encodePayload({
    accessToken,
    exp: issuedAt + ONE_HOUR_IN_SECONDS,
    iat: issuedAt,
    type: 'editor-sync'
  })

  return `${payload}.${signPayload(payload, secret)}`
}

export function verifyEditorSyncToken(token: string) {
  const secret = getSyncTokenSecret()

  if (!secret) {
    return null
  }

  const [encodedPayload, signature] = token.split('.')

  if (!encodedPayload || !signature) {
    return null
  }

  if (!safeEqual(signature, signPayload(encodedPayload, secret))) {
    return null
  }

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8')) as Partial<SyncTokenPayload>

    if (payload.type !== 'editor-sync' || typeof payload.accessToken !== 'string' || typeof payload.exp !== 'number') {
      return null
    }

    if (payload.exp <= Math.floor(Date.now() / 1000)) {
      return null
    }

    return payload.accessToken
  } catch {
    return null
  }
}
