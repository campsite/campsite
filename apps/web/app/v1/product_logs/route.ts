import { withAuth } from '@workos-inc/authkit-nextjs'
import { NextResponse } from 'next/server'

import { recordLegacyProductLogs } from '@/lib/convex/realtime'

export async function POST(request: Request) {
  const { accessToken } = await withAuth()
  const body = (await request.json().catch(() => null)) as
    | {
        events?: {
          user_id?: string
          org_slug?: string
          name: string
          data?: object
          log_ts?: number
          session_id?: string
        }[]
      }
    | null

  if (!body?.events || !Array.isArray(body.events)) {
    return NextResponse.json({ code: 'invalid_request', message: 'events is required' }, { status: 400 })
  }

  await recordLegacyProductLogs(accessToken, {
    events: body.events.map((event) => ({
      userId: event.user_id,
      orgSlug: event.org_slug,
      name: event.name,
      dataJson: event.data ? JSON.stringify(event.data) : undefined,
      logTs: event.log_ts,
      sessionId: event.session_id
    })),
    metadataJson: JSON.stringify({
      isPwa: request.headers.get('x-campsite-pwa') === 'true'
    }),
    userAgent: request.headers.get('user-agent') || undefined
  })

  return NextResponse.json({}, { status: 201 })
}
