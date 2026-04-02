import { NextResponse } from 'next/server'

import { getLegacyCustomReactionById } from '@/lib/convex/collaboration'
import { createLegacyReaction } from '@/lib/convex/engagement'
import { routeErrorResponse } from '@/lib/routeErrors'
import { getRouteAccess, routeUnauthorizedResponse } from '@/lib/routeSession'

interface Context {
  params: Promise<{ orgSlug: string; messageId: string }>
}

function parseCustomContent(value: unknown) {
  if (typeof value !== 'object' || value === null) {
    return undefined
  }

  const candidate = value as Record<string, unknown>

  if (
    typeof candidate.id !== 'string' ||
    typeof candidate.name !== 'string' ||
    typeof candidate.file_url !== 'string' ||
    typeof candidate.created_at !== 'string'
  ) {
    return undefined
  }

  return {
    id: candidate.id,
    name: candidate.name,
    file_url: candidate.file_url,
    created_at: candidate.created_at
  }
}

export async function POST(request: Request, context: Context) {
  const auth = await getRouteAccess()
  const { orgSlug, messageId } = await context.params

  if (!auth) {
    return routeUnauthorizedResponse()
  }

  const body = await request.json()

  try {
    const customReactionId = typeof body.custom_content_id === 'string' ? body.custom_content_id : undefined
    const customContent = customReactionId
      ? await getLegacyCustomReactionById(auth.accessToken, { slug: orgSlug, id: customReactionId })
      : null

    return NextResponse.json(
      await createLegacyReaction(auth.accessToken, {
        slug: orgSlug,
        subjectType: 'Message',
        subjectId: messageId,
        content: typeof body.content === 'string' ? body.content : undefined,
        customContent:
          parseCustomContent(body.custom_content) ||
          (customContent
            ? {
                id: customContent.id,
                name: customContent.name,
                file_url: customContent.file_url,
                created_at: customContent.created_at
              }
            : undefined)
      })
    )
  } catch (error) {
    return routeErrorResponse(error)
  }
}
