import { NextResponse } from 'next/server'

import { createLegacyFigmaFileAttachmentDetails } from '@/lib/convex/externalPlatforms'
import { routeErrorResponse } from '@/lib/routeErrors'
import { getRouteAccess, routeUnauthorizedResponse } from '@/lib/routeSession'

interface Context {
  params: Promise<{ orgSlug: string }>
}

export async function POST(request: Request, context: Context) {
  const auth = await getRouteAccess()
  const { orgSlug } = await context.params

  if (!auth) {
    return routeUnauthorizedResponse()
  }

  const body = (await request.json().catch(() => null)) as { figma_file_url?: string } | null

  try {
    return NextResponse.json(
      await createLegacyFigmaFileAttachmentDetails(auth.accessToken, {
        slug: orgSlug,
        figmaFileUrl: body?.figma_file_url || ''
      })
    )
  } catch (error) {
    return routeErrorResponse(error)
  }
}
