import { getWorkOS, refreshSession } from '@workos-inc/authkit-nextjs'

import type { CurrentUser } from '@campsite/types'

import {
  AccountCompatError,
  assertValidTimeZone,
  buildMetadata,
  generateBackupCodes,
  mapWorkOSError,
  normalizeEmail,
  normalizeString,
  parseBooleanMetadataValue,
  splitName
} from '@/lib/auth/accountCompatCore'
import { getLegacyCurrentUser, updateViewerPreference } from '@/lib/convex/server'

export { accountCompatErrorResponse } from '@/lib/auth/accountCompatCore'

const TOTP_ISSUER = 'Campsite'

const METADATA_KEYS = {
  managed: 'campsite_managed',
  legacyManaged: 'managed',
  directoryManaged: 'directory_managed',
  pendingFactorId: 'campsite_pending_totp_factor_id',
  pendingChallengeId: 'campsite_pending_totp_challenge_id'
} as const

interface PasswordAuthenticationResponse extends AuthenticationResponse {
  authenticationChallengeId?: string
  pendingAuthenticationToken?: string
}

interface PendingTwoFactorEnrollment {
  challengeId?: string
  factorId?: string
}

interface TwoFactorVerificationResult {
  usedPasswordTotp: boolean
}

type AuthenticationResponse = Awaited<ReturnType<ReturnType<typeof getWorkOS>['userManagement']['authenticateWithPassword']>>
type User = Awaited<ReturnType<ReturnType<typeof getWorkOS>['userManagement']['getUser']>>
type RefreshedSession = Awaited<ReturnType<typeof refreshSession>>

function getPendingTwoFactorEnrollment(user: User): PendingTwoFactorEnrollment {
  return {
    challengeId: normalizeString(user.metadata[METADATA_KEYS.pendingChallengeId]),
    factorId: normalizeString(user.metadata[METADATA_KEYS.pendingFactorId])
  }
}

function isPendingTwoFactorAuthentication(
  response: PasswordAuthenticationResponse
): response is PasswordAuthenticationResponse & {
  authenticationChallengeId: string
  pendingAuthenticationToken: string
} {
  return (
    typeof response.pendingAuthenticationToken === 'string' &&
    response.pendingAuthenticationToken.length > 0 &&
    typeof response.authenticationChallengeId === 'string' &&
    response.authenticationChallengeId.length > 0
  )
}

async function getFreshWorkOSUser(userId: string) {
  return await getWorkOS().userManagement.getUser(userId)
}

async function listTotpFactors(userId: string) {
  const factorList = await getWorkOS().userManagement.listAuthFactors({ userId })

  return factorList.data.filter((factor) => factor.type === 'totp')
}

async function clearPendingTwoFactorEnrollment(user: User) {
  return await getWorkOS().userManagement.updateUser({
    userId: user.id,
    metadata: buildMetadata(user.metadata, {
      [METADATA_KEYS.pendingChallengeId]: null,
      [METADATA_KEYS.pendingFactorId]: null
    })
  })
}

async function verifyTotpFactor(factorId: string, otpAttempt?: string) {
  const code = normalizeString(otpAttempt)

  if (!code) {
    throw new AccountCompatError(422, 'invalid_otp', 'Authentication code is required.')
  }

  try {
    const challenge = await getWorkOS().mfa.challengeFactor({
      authenticationFactorId: factorId
    })
    const verification = await getWorkOS().mfa.verifyChallenge({
      authenticationChallengeId: challenge.id,
      code
    })

    if (!verification.valid) {
      throw new AccountCompatError(422, 'invalid_otp', 'Authentication code is invalid.')
    }
  } catch (error) {
    if (error instanceof AccountCompatError) {
      throw error
    }

    throw mapWorkOSError(error, 'Authentication code is invalid.', 'invalid_otp')
  }
}

async function verifyViewerPassword(user: User, password?: string, otpAttempt?: string): Promise<TwoFactorVerificationResult> {
  const normalizedPassword = normalizeString(password)

  if (!normalizedPassword) {
    throw new AccountCompatError(422, 'invalid_credentials', 'Current password is required.')
  }

  let authentication: PasswordAuthenticationResponse

  try {
    authentication = (await getWorkOS().userManagement.authenticateWithPassword({
      email: user.email,
      password: normalizedPassword
    })) as PasswordAuthenticationResponse
  } catch (error) {
    throw mapWorkOSError(error, 'Current password is incorrect.', 'invalid_credentials')
  }

  if (!isPendingTwoFactorAuthentication(authentication)) {
    return { usedPasswordTotp: false }
  }

  const code = normalizeString(otpAttempt)

  if (!code) {
    throw new AccountCompatError(
      422,
      'otp_required',
      'Two-factor enabled accounts must use the reset link on /login to change passwords.'
    )
  }

  try {
    await getWorkOS().userManagement.authenticateWithTotp({
      code,
      pendingAuthenticationToken: authentication.pendingAuthenticationToken,
      authenticationChallengeId: authentication.authenticationChallengeId
    })

    return { usedPasswordTotp: true }
  } catch (error) {
    throw mapWorkOSError(error, 'Authentication code is invalid.', 'invalid_otp')
  }
}

export function getClientTimeZone(request: Request) {
  const timeZone = normalizeString(request.headers.get('X-Campsite-Tz'))

  if (!timeZone) {
    return null
  }

  try {
    assertValidTimeZone(timeZone)
    return timeZone
  } catch {
    return null
  }
}

export function isManagedWorkOSUser(user: User) {
  return (
    parseBooleanMetadataValue(user.metadata[METADATA_KEYS.managed]) ||
    parseBooleanMetadataValue(user.metadata[METADATA_KEYS.legacyManaged]) ||
    parseBooleanMetadataValue(user.metadata[METADATA_KEYS.directoryManaged])
  )
}

export async function buildCurrentUserResponse(
  accessToken: string,
  {
    clientTimeZone,
    userId,
    workosUser
  }: {
    clientTimeZone?: string | null
    userId: string
    workosUser?: User
  }
): Promise<CurrentUser> {
  let legacyUser = await getLegacyCurrentUser(accessToken)

  if (!legacyUser.timezone && clientTimeZone) {
    await updateViewerPreference(accessToken, {
      preference: 'timezone',
      value: clientTimeZone
    })
    legacyUser = await getLegacyCurrentUser(accessToken)
  }

  const freshUser = workosUser ?? (await getFreshWorkOSUser(userId))
  const factors = await listTotpFactors(freshUser.id)

  return {
    ...legacyUser,
    email: freshUser.email || legacyUser.email,
    email_confirmed: freshUser.emailVerified,
    managed: isManagedWorkOSUser(freshUser),
    two_factor_enabled: factors.length > 0,
    unconfirmed_email: freshUser.emailVerified ? null : freshUser.email
  } as CurrentUser
}

export async function updateViewerWorkOSProfile(
  user: User,
  {
    email,
    name
  }: {
    email?: string
    name?: string
  }
): Promise<User> {
  const normalizedEmail = typeof email === 'string' ? normalizeEmail(email) : undefined
  const normalizedName = typeof name === 'string' ? normalizeString(name) : undefined
  const { firstName, lastName } = splitName(normalizedName)

  const update: {
    email?: string
    firstName?: string
    lastName?: string
    userId: string
  } = {
    userId: user.id
  }

  const emailChanged = !!normalizedEmail && normalizedEmail !== normalizeEmail(user.email)
  const nameChanged =
    !!normalizedName &&
    (firstName !== normalizeString(user.firstName) || lastName !== normalizeString(user.lastName))

  if (!emailChanged && !nameChanged) {
    return user
  }

  if (emailChanged) {
    update.email = normalizedEmail
  }

  if (nameChanged) {
    if (firstName) {
      update.firstName = firstName
    }

    if (lastName) {
      update.lastName = lastName
    }
  }

  let updatedUser: User

  try {
    updatedUser = await getWorkOS().userManagement.updateUser(update)
  } catch (error) {
    throw mapWorkOSError(error, 'Unable to update your account details.', 'profile_update_failed')
  }

  if (emailChanged && !updatedUser.emailVerified) {
    try {
      await getWorkOS().userManagement.sendVerificationEmail({ userId: updatedUser.id })
    } catch (error) {
      throw mapWorkOSError(error, 'Unable to send a verification email.', 'verification_email_failed')
    }
  }

  return updatedUser
}

export async function updateViewerPassword(
  user: User,
  {
    currentPassword,
    password,
    passwordConfirmation
  }: {
    currentPassword?: string
    password?: string
    passwordConfirmation?: string
  }
): Promise<void> {
  const newPassword = normalizeString(password)
  const confirmation = normalizeString(passwordConfirmation)

  if (!newPassword || newPassword.length < 10) {
    throw new AccountCompatError(422, 'invalid_password', 'New password must be at least 10 characters.')
  }

  if (!confirmation || newPassword !== confirmation) {
    throw new AccountCompatError(422, 'invalid_password_confirmation', 'New password confirmation does not match.')
  }

  try {
    await verifyViewerPassword(user, currentPassword)
  } catch (error) {
    if (error instanceof AccountCompatError && error.code === 'otp_required') {
      throw new AccountCompatError(
        422,
        'password_reset_required',
        'Two-factor enabled accounts must use the reset link on /login to change passwords.'
      )
    }

    throw error
  }

  try {
    await getWorkOS().userManagement.updateUser({
      userId: user.id,
      password: newPassword
    })
  } catch (error) {
    throw mapWorkOSError(error, 'Unable to update your password.', 'password_update_failed')
  }
}

export async function updateViewerTimeZone(accessToken: string, timeZone: string): Promise<void> {
  assertValidTimeZone(timeZone)

  await updateViewerPreference(accessToken, {
    preference: 'timezone',
    value: timeZone
  })
}

export async function sendViewerEmailConfirmation(user: User): Promise<void> {
  if (user.emailVerified) {
    return
  }

  try {
    await getWorkOS().userManagement.sendVerificationEmail({ userId: user.id })
  } catch (error) {
    throw mapWorkOSError(error, 'Unable to send a verification email.', 'verification_email_failed')
  }
}

export async function startViewerTwoFactorEnrollment(user: User): Promise<string> {
  if (!normalizeEmail(user.email) || !user.emailVerified) {
    throw new AccountCompatError(422, 'invalid_email', 'A verified email address is required to enable two-factor.')
  }

  const existingFactors = await listTotpFactors(user.id)

  if (existingFactors.length > 0) {
    throw new AccountCompatError(409, 'two_factor_enabled', 'Two-factor authentication is already enabled.')
  }

  const pendingEnrollment = getPendingTwoFactorEnrollment(user)

  if (pendingEnrollment.factorId) {
    try {
      await getWorkOS().mfa.deleteFactor(pendingEnrollment.factorId)
    } catch {
      // Ignore stale pending factors and replace them with a fresh enrollment.
    }
  }

  let enrollment: {
    authenticationChallenge: { id: string }
    authenticationFactor: { id: string; totp: { uri: string } }
  }

  try {
    enrollment = await getWorkOS().userManagement.enrollAuthFactor({
      userId: user.id,
      type: 'totp',
      totpIssuer: TOTP_ISSUER,
      totpUser: normalizeEmail(user.email)
    })
  } catch (error) {
    throw mapWorkOSError(error, 'Unable to start two-factor setup.', 'two_factor_setup_failed')
  }

  try {
    await getWorkOS().userManagement.updateUser({
      userId: user.id,
      metadata: buildMetadata(user.metadata, {
        [METADATA_KEYS.pendingChallengeId]: enrollment.authenticationChallenge.id,
        [METADATA_KEYS.pendingFactorId]: enrollment.authenticationFactor.id
      })
    })
  } catch (error) {
    throw mapWorkOSError(error, 'Unable to store two-factor setup state.', 'two_factor_setup_failed')
  }

  return enrollment.authenticationFactor.totp.uri
}

export async function completeViewerTwoFactorEnrollment(
  user: User,
  {
    otpAttempt,
    password
  }: {
    otpAttempt?: string
    password?: string
  }
): Promise<{ backupCodes: string[] }> {
  const pendingEnrollment = getPendingTwoFactorEnrollment(user)

  if (!pendingEnrollment.challengeId || !pendingEnrollment.factorId) {
    throw new AccountCompatError(
      409,
      'two_factor_setup_missing',
      'Start two-factor setup again before confirming it.'
    )
  }

  await verifyViewerPassword(user, password)

  const code = normalizeString(otpAttempt)

  if (!code) {
    throw new AccountCompatError(422, 'invalid_otp', 'Authentication code is required.')
  }

  try {
    const verification = await getWorkOS().mfa.verifyChallenge({
      authenticationChallengeId: pendingEnrollment.challengeId,
      code
    })

    if (!verification.valid) {
      throw new AccountCompatError(422, 'invalid_otp', 'Authentication code is invalid.')
    }
  } catch (error) {
    if (error instanceof AccountCompatError) {
      throw error
    }

    throw mapWorkOSError(error, 'Authentication code is invalid.', 'invalid_otp')
  }

  await clearPendingTwoFactorEnrollment(user)

  return {
    backupCodes: generateBackupCodes()
  }
}

export async function disableViewerTwoFactor(
  user: User,
  {
    otpAttempt,
    password
  }: {
    otpAttempt?: string
    password?: string
  }
): Promise<void> {
  const factor = (await listTotpFactors(user.id))[0]

  if (!factor) {
    return
  }

  const verification = await verifyViewerPassword(user, password, otpAttempt)

  if (!verification.usedPasswordTotp) {
    await verifyTotpFactor(factor.id, otpAttempt)
  }

  try {
    await getWorkOS().mfa.deleteFactor(factor.id)
  } catch (error) {
    throw mapWorkOSError(error, 'Unable to disable two-factor authentication.', 'two_factor_disable_failed')
  }

  await clearPendingTwoFactorEnrollment(user)
}

export async function refreshViewerSession(): Promise<RefreshedSession | null> {
  try {
    return await refreshSession()
  } catch {
    return null
  }
}

export async function getFreshViewerAccount(userId: string): Promise<User> {
  return await getFreshWorkOSUser(userId)
}
