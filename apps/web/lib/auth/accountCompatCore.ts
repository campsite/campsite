import { randomInt } from 'crypto'

import { NextResponse } from 'next/server'

const BACKUP_CODE_COUNT = 8
const BACKUP_CODE_LENGTH = 8

export class AccountCompatError extends Error {
  code: string
  status: number

  constructor(status: number, code: string, message: string) {
    super(message)
    this.status = status
    this.code = code
  }
}

export function normalizeString(value?: string | null) {
  const trimmed = value?.trim()

  return trimmed ? trimmed : undefined
}

export function normalizeEmail(value?: string | null) {
  const normalized = normalizeString(value)

  return normalized ? normalized.toLowerCase() : undefined
}

export function splitName(value?: string | null) {
  const normalized = normalizeString(value)

  if (!normalized) {
    return {}
  }

  const [firstName, ...rest] = normalized.split(/\s+/).filter(Boolean)

  return {
    firstName,
    lastName: rest.length > 0 ? rest.join(' ') : undefined
  }
}

export function extractStatus(error: unknown) {
  if (typeof error === 'object' && error && 'status' in error && typeof error.status === 'number') {
    return error.status
  }

  return undefined
}

function extractOAuthError(error: unknown) {
  if (typeof error === 'object' && error && 'error' in error && typeof error.error === 'string') {
    return error.error
  }

  return undefined
}

export function extractMessage(error: unknown, fallback: string) {
  if (typeof error === 'object' && error && 'message' in error && typeof error.message === 'string' && error.message) {
    return error.message
  }

  return fallback
}

export function parseBooleanMetadataValue(value?: string | null) {
  if (!value) {
    return false
  }

  return ['1', 'true', 'yes'].includes(value.toLowerCase())
}

export function buildMetadata(
  metadata: Record<string, string>,
  patch: Record<string, string | null | undefined>
) {
  const nextMetadata: Record<string, string | null> = { ...metadata }

  for (const [key, value] of Object.entries(patch)) {
    nextMetadata[key] = value ?? null
  }

  return nextMetadata
}

export function assertValidTimeZone(timeZone: string) {
  try {
    Intl.DateTimeFormat(undefined, { timeZone })
  } catch {
    throw new AccountCompatError(422, 'invalid_timezone', 'Timezone is invalid.')
  }
}

export function generateBackupCodes() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

  return Array.from({ length: BACKUP_CODE_COUNT }, () => {
    const value = Array.from({ length: BACKUP_CODE_LENGTH }, () => alphabet[randomInt(0, alphabet.length)]).join('')

    return `${value.slice(0, 4)}-${value.slice(4)}`
  })
}

export function mapWorkOSError(error: unknown, fallbackMessage: string, fallbackCode = 'workos_error') {
  const oauthError = extractOAuthError(error)

  if (oauthError === 'invalid_grant') {
    return new AccountCompatError(422, 'invalid_credentials', 'Current password is incorrect.')
  }

  if (extractStatus(error) === 409) {
    return new AccountCompatError(422, fallbackCode, fallbackMessage)
  }

  return new AccountCompatError(extractStatus(error) ?? 500, fallbackCode, extractMessage(error, fallbackMessage))
}

export function accountCompatErrorResponse(error: unknown, fallbackMessage = 'Request failed') {
  if (error instanceof AccountCompatError) {
    return NextResponse.json(
      {
        code: error.code,
        message: error.message
      },
      { status: error.status }
    )
  }

  const status = extractStatus(error) ?? 500

  return NextResponse.json(
    {
      code: 'internal_error',
      message: extractMessage(error, fallbackMessage)
    },
    { status }
  )
}
