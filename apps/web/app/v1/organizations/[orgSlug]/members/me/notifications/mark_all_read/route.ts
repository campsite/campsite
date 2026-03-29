import { withAuth } from '@workos-inc/authkit-nextjs'
import { NextResponse } from 'next/server'

import { markLegacyNotificationsRead } from '@/lib/convex/notifications'
import { ensureWorkspace } from '@/lib/convex/server'

interface Context {
  params: Promise<{ orgSlug: string }>
}

export async function POST(_request: Request, context: Context) {
  const { accessToken, user } = await withAuth()
  const { orgSlug } = await context.params

  if (!user || !accessToken) {
    return NextResponse.json({ code: 'unauthorized', message: 'Sign in required' }, { status: 401 })
  }

  const body = await _request.json().catch(() => ({}))

  await ensureWorkspace(accessToken, user)
  await markLegacyNotificationsRead(
    accessToken,
    {
      slug: orgSlug,
      homeOnly: body.home_only === true
    } as any
  )

  return NextResponse.json({})
}
