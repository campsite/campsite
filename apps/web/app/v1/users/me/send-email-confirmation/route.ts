import { withAuth } from '@workos-inc/authkit-nextjs'
import { NextResponse } from 'next/server'

import { accountCompatErrorResponse, getFreshViewerAccount, sendViewerEmailConfirmation } from '@/lib/auth/accountCompat'
import { ensureWorkspace } from '@/lib/convex/server'

export async function POST() {
  const { accessToken, user } = await withAuth()

  if (!user || !accessToken) {
    return NextResponse.json({ code: 'unauthorized', message: 'Sign in required' }, { status: 401 })
  }

  await ensureWorkspace(accessToken, user)

  try {
    const workosUser = await getFreshViewerAccount(user.id)

    await sendViewerEmailConfirmation(workosUser)

    return NextResponse.json({})
  } catch (error) {
    return accountCompatErrorResponse(error, 'Unable to send a verification email.')
  }
}
