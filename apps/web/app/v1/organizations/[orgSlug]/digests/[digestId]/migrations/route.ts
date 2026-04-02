import { NextResponse } from 'next/server'

import { getLegacyDigestMigration } from '@/lib/convex/notes'
import { routeErrorResponse } from '@/lib/routeErrors'
import { getRouteAccess, routeUnauthorizedResponse } from '@/lib/routeSession'

interface Context {
  params: Promise<{ orgSlug: string; digestId: string }>
}

export async function GET(_: Request, context: Context) {
  const auth = await getRouteAccess()
  const { orgSlug, digestId } = await context.params

  if (!auth) {
    return routeUnauthorizedResponse()
  }

  try {
    return NextResponse.json(
      await getLegacyDigestMigration(auth.accessToken, {
        slug: orgSlug,
        digestId
      })
    )
  } catch (error) {
    return routeErrorResponse(error)
  }
}
