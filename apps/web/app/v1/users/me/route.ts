import { withAuth } from '@workos-inc/authkit-nextjs'
import { NextResponse } from 'next/server'

import {
  accountCompatErrorResponse,
  buildCurrentUserResponse,
  getClientTimeZone,
  getFreshViewerAccount,
  isManagedWorkOSUser,
  refreshViewerSession,
  updateViewerPassword,
  updateViewerWorkOSProfile
} from '@/lib/auth/accountCompat'
import { buildCurrentUser } from '@/lib/auth/campsiteCompat'
import { ensureWorkspace, updateViewerProfile } from '@/lib/convex/server'

export async function GET(request: Request) {
  const { accessToken, user } = await withAuth()

  if (!user || !accessToken) {
    return NextResponse.json(buildCurrentUser(null))
  }

  await ensureWorkspace(accessToken, user)

  try {
    return NextResponse.json(
      await buildCurrentUserResponse(accessToken, {
        clientTimeZone: getClientTimeZone(request),
        userId: user.id
      })
    )
  } catch (error) {
    return accountCompatErrorResponse(error, 'Unable to load your account.')
  }
}

export async function PATCH(request: Request) {
  const { accessToken, user } = await withAuth()

  if (!user || !accessToken) {
    return NextResponse.json({ code: 'unauthorized', message: 'Sign in required' }, { status: 401 })
  }

  const body = await request.json()
  const nextEmail = typeof body.email === 'string' ? body.email.trim() : undefined
  const nextName = typeof body.name === 'string' ? body.name.trim() : undefined
  const nextUsername = typeof body.username === 'string' ? body.username : undefined

  await ensureWorkspace(accessToken, user)

  if (typeof body.name === 'string' && !nextName) {
    return NextResponse.json({ code: 'invalid_request', message: 'Name is required.' }, { status: 422 })
  }

  if (typeof body.email === 'string' && !nextEmail) {
    return NextResponse.json({ code: 'invalid_request', message: 'Email is required.' }, { status: 422 })
  }

  try {
    let workosUser = await getFreshViewerAccount(user.id)
    const managed = isManagedWorkOSUser(workosUser)

    if (body.password || body.password_confirmation || body.current_password) {
      if (managed) {
        return NextResponse.json(
          {
            code: 'managed_user',
            message: 'Password changes are disabled for managed accounts.'
          },
          { status: 422 }
        )
      }

      await updateViewerPassword(workosUser, {
        currentPassword: body.current_password,
        password: body.password,
        passwordConfirmation: body.password_confirmation
      })
    }

    if (typeof nextEmail === 'string' && managed && nextEmail.toLowerCase() !== workosUser.email.toLowerCase()) {
      return NextResponse.json(
        {
          code: 'managed_user',
          message: 'Email changes are disabled for managed accounts.'
        },
        { status: 422 }
      )
    }

    if (typeof nextEmail === 'string' || typeof nextName === 'string') {
      workosUser = await updateViewerWorkOSProfile(workosUser, {
        email: nextEmail,
        name: nextName
      })

      await refreshViewerSession()
    }

    await updateViewerProfile(accessToken, {
      avatarPath: typeof body.avatar_path === 'string' || body.avatar_path === null ? body.avatar_path : undefined,
      coverPhotoPath:
        typeof body.cover_photo_path === 'string' || body.cover_photo_path === null ? body.cover_photo_path : undefined,
      email: nextEmail,
      name: nextName,
      username: nextUsername
    })

    return NextResponse.json(
      await buildCurrentUserResponse(accessToken, {
        userId: user.id,
        workosUser
      })
    )
  } catch (error) {
    return accountCompatErrorResponse(error, 'Unable to update your account.')
  }
}
