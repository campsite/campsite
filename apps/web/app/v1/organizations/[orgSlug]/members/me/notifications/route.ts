import { withAuth } from '@workos-inc/authkit-nextjs'
import { NextResponse } from 'next/server'

import { getLegacyNotificationsPage } from '@/lib/convex/notifications'
import { ensureWorkspace } from '@/lib/convex/server'

interface Context {
  params: Promise<{ orgSlug: string }>
}

export async function GET(request: Request, context: Context) {
  const { accessToken, user } = await withAuth()
  const { orgSlug } = await context.params

  if (!user || !accessToken) {
    return NextResponse.json({ data: [], next_cursor: null, prev_cursor: null })
  }

  const searchParams = new URL(request.url).searchParams

  await ensureWorkspace(accessToken, user)

  return NextResponse.json(
    await getLegacyNotificationsPage(accessToken, {
      slug: orgSlug,
      unread: searchParams.get('unread') === 'true',
      filter: (searchParams.get('filter') as 'home' | 'grouped_home' | 'activity' | null) ?? undefined,
      after: searchParams.get('after') ?? undefined,
      limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined
    })
  )
}
