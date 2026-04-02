import { withAuth } from '@workos-inc/authkit-nextjs'
import { NextResponse } from 'next/server'

import { ensureWorkspace, updateViewerPreference } from '@/lib/convex/server'

export async function PUT(request: Request) {
  const { accessToken, user } = await withAuth()

  if (!user || !accessToken) {
    return NextResponse.json({ code: 'unauthorized', message: 'Sign in required' }, { status: 401 })
  }

  const body = await request.json()

  if (typeof body.preference !== 'string' || typeof body.value !== 'string') {
    return NextResponse.json({ code: 'invalid_request', message: 'Preference and value are required.' }, { status: 400 })
  }

  await ensureWorkspace(accessToken, user)

  return NextResponse.json(await updateViewerPreference(accessToken, body))
}
