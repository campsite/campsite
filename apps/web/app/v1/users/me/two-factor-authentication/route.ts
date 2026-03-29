import { withAuth } from '@workos-inc/authkit-nextjs'
import { NextResponse } from 'next/server'

import {
  accountCompatErrorResponse,
  completeViewerTwoFactorEnrollment,
  disableViewerTwoFactor,
  getFreshViewerAccount,
  isManagedWorkOSUser,
  startViewerTwoFactorEnrollment
} from '@/lib/auth/accountCompat'
import { ensureWorkspace } from '@/lib/convex/server'

function managedUserResponse() {
  return NextResponse.json(
    {
      code: 'managed_user',
      message: 'Two-factor settings are disabled for managed accounts.'
    },
    { status: 422 }
  )
}

export async function POST() {
  const { accessToken, user } = await withAuth()

  if (!user || !accessToken) {
    return NextResponse.json({ code: 'unauthorized', message: 'Sign in required' }, { status: 401 })
  }

  await ensureWorkspace(accessToken, user)

  try {
    const workosUser = await getFreshViewerAccount(user.id)

    if (isManagedWorkOSUser(workosUser)) {
      return managedUserResponse()
    }

    return NextResponse.json({
      two_factor_provisioning_uri: await startViewerTwoFactorEnrollment(workosUser)
    })
  } catch (error) {
    return accountCompatErrorResponse(error, 'Unable to start two-factor setup.')
  }
}

export async function PUT(request: Request) {
  const { accessToken, user } = await withAuth()

  if (!user || !accessToken) {
    return NextResponse.json({ code: 'unauthorized', message: 'Sign in required' }, { status: 401 })
  }

  const body = await request.json()

  await ensureWorkspace(accessToken, user)

  try {
    const workosUser = await getFreshViewerAccount(user.id)

    if (isManagedWorkOSUser(workosUser)) {
      return managedUserResponse()
    }

    const result = await completeViewerTwoFactorEnrollment(workosUser, {
      otpAttempt: typeof body.otp_attempt === 'string' ? body.otp_attempt : undefined,
      password: typeof body.password === 'string' ? body.password : undefined
    })

    return NextResponse.json({
      two_factor_backup_codes: result.backupCodes
    })
  } catch (error) {
    return accountCompatErrorResponse(error, 'Unable to enable two-factor authentication.')
  }
}

export async function DELETE(request: Request) {
  const { accessToken, user } = await withAuth()

  if (!user || !accessToken) {
    return NextResponse.json({ code: 'unauthorized', message: 'Sign in required' }, { status: 401 })
  }

  const body = await request.json()

  await ensureWorkspace(accessToken, user)

  try {
    const workosUser = await getFreshViewerAccount(user.id)

    if (isManagedWorkOSUser(workosUser)) {
      return managedUserResponse()
    }

    await disableViewerTwoFactor(workosUser, {
      otpAttempt: typeof body.otp_attempt === 'string' ? body.otp_attempt : undefined,
      password: typeof body.password === 'string' ? body.password : undefined
    })

    return NextResponse.json({})
  } catch (error) {
    return accountCompatErrorResponse(error, 'Unable to disable two-factor authentication.')
  }
}
