import { createHmac, randomUUID, timingSafeEqual } from 'crypto'

interface HmsCredentials {
  appAccessKey: string
  appSecret: string
}

function getViewerRole() {
  return process.env.HMS_VIEWER_ROLE || process.env.HMS_ROLE || 'guest'
}

export function getHmsWebhookPasscode() {
  return process.env.HMS_WEBHOOK_PASSCODE || process.env.HMS_WEBHOOK_PASSCODE_SECRET || null
}

export function isValidHmsWebhookPasscode(passcode: string | null | undefined) {
  const expected = getHmsWebhookPasscode()

  if (!expected || !passcode) {
    return false
  }

  const expectedBuffer = Buffer.from(expected)
  const receivedBuffer = Buffer.from(passcode)

  if (expectedBuffer.length !== receivedBuffer.length) {
    return false
  }

  return timingSafeEqual(expectedBuffer, receivedBuffer)
}

function getHmsCredentials(): HmsCredentials | null {
  const appAccessKey = process.env.HMS_APP_ACCESS_KEY
  const appSecret = process.env.HMS_APP_SECRET

  if (!appAccessKey || !appSecret) {
    return null
  }

  return { appAccessKey, appSecret }
}

function base64UrlEncode(value: Buffer | string) {
  const buffer = Buffer.isBuffer(value) ? value : Buffer.from(value)

  return buffer
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')
}

function signJwt(payload: Record<string, unknown>, secret: string) {
  const header = { alg: 'HS256', typ: 'JWT' }
  const encodedHeader = base64UrlEncode(JSON.stringify(header))
  const encodedPayload = base64UrlEncode(JSON.stringify(payload))
  const data = `${encodedHeader}.${encodedPayload}`
  const signature = createHmac('sha256', secret).update(data).digest()

  return `${data}.${base64UrlEncode(signature)}`
}

function buildHmsManagementToken(credentials: HmsCredentials) {
  const now = Math.floor(Date.now() / 1000)

  return signJwt(
    {
      access_key: credentials.appAccessKey,
      type: 'management',
      version: 2,
      jti: randomUUID(),
      iat: now,
      nbf: now,
      exp: now + 86400
    },
    credentials.appSecret
  )
}

export async function createHmsRoom(): Promise<string | null> {
  const credentials = getHmsCredentials()

  if (!credentials) {
    return null
  }

  const response = await fetch('https://api.100ms.live/v2/rooms', {
    method: 'POST',
    signal: AbortSignal.timeout(5000),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${buildHmsManagementToken(credentials)}`
    },
    body: JSON.stringify({})
  })

  if (!response.ok) {
    throw new Error(`Unable to create 100ms room (${response.status})`)
  }

  const payload = (await response.json()) as { id?: string }

  return payload.id ?? null
}

export function createHmsViewerToken(params: { roomId?: string | null; userId?: string | null }) {
  const credentials = getHmsCredentials()

  if (!credentials || !params.roomId) {
    return null
  }

  const now = Math.floor(Date.now() / 1000)

  return signJwt(
    {
      access_key: credentials.appAccessKey,
      room_id: params.roomId,
      user_id: params.userId ?? undefined,
      role: getViewerRole(),
      type: 'app',
      jti: randomUUID(),
      version: 2,
      iat: now,
      nbf: now,
      exp: now + 86400
    },
    credentials.appSecret
  )
}
