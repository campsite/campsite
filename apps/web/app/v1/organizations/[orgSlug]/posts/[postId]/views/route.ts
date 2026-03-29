import { withAuth } from '@workos-inc/authkit-nextjs'
import { NextResponse } from 'next/server'

import { createLegacyPostView, ensureWorkspace, getLegacyPostViewsPage } from '@/lib/convex/server'
import { routeErrorResponse } from '@/lib/routeErrors'
import { getRouteAccess, routeUnauthorizedResponse } from '@/lib/routeSession'

interface Context {
  params: Promise<{ orgSlug: string; postId: string }>
}

export async function GET(request: Request, context: Context) {
  const auth = await getRouteAccess()
  const { orgSlug, postId } = await context.params

  if (!auth) {
    return routeUnauthorizedResponse()
  }

  const url = new URL(request.url)

  try {
    return NextResponse.json(
      await getLegacyPostViewsPage(auth.accessToken, {
        slug: orgSlug,
        postId,
        after: url.searchParams.get('after') ?? undefined
      })
    )
  } catch (error) {
    return routeErrorResponse(error)
  }
}

export async function POST(request: Request, context: Context) {
  const { accessToken, user } = await withAuth()
  const { orgSlug, postId } = await context.params

  if (!accessToken) {
    return routeUnauthorizedResponse()
  }

  if (user) {
    await ensureWorkspace(accessToken, user)
  }

  const body = await request.json().catch(() => ({}))

  try {
    return NextResponse.json(
      await createLegacyPostView(accessToken, {
        slug: orgSlug,
        postId,
        read: !!body.read,
        skip_notifications:
          typeof body.skip_notifications === 'boolean' ? body.skip_notifications : undefined,
        dwell_time: typeof body.dwell_time === 'number' ? body.dwell_time : undefined
      })
    )
  } catch (error) {
    return routeErrorResponse(error)
  }
}
