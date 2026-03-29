import { withAuth } from '@workos-inc/authkit-nextjs'
import { NextResponse } from 'next/server'

import { accountCompatErrorResponse, updateViewerTimeZone } from '@/lib/auth/accountCompat'
import { ensureWorkspace } from '@/lib/convex/server'

export async function POST(request: Request) {
  const { accessToken, user } = await withAuth()

  if (!user || !accessToken) {
    return NextResponse.json({ code: 'unauthorized', message: 'Sign in required' }, { status: 401 })
  }

  const body = await request.json()

  if (typeof body.timezone !== 'string' || !body.timezone.trim()) {
    return NextResponse.json({ code: 'invalid_request', message: 'Timezone is required.' }, { status: 422 })
  }

  await ensureWorkspace(accessToken, user)

  try {
    await updateViewerTimeZone(accessToken, body.timezone.trim())

    return NextResponse.json({})
  } catch (error) {
    return accountCompatErrorResponse(error, 'Unable to update your timezone.')
  }
}
