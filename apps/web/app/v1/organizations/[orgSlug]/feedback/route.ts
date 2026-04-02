import { withAuth } from '@workos-inc/authkit-nextjs'
import { NextResponse } from 'next/server'

import { createLegacyFeedback } from '@/lib/convex/adminOps'
import { ensureWorkspace } from '@/lib/convex/server'
import { routeErrorResponse } from '@/lib/routeErrors'

function parseUserAgent(request: Request) {
  const value = request.headers.get('user-agent') || ''
  const segments = value.split(' ').filter(Boolean)

  return {
    browserInfo: segments.slice(0, 2).join(' ') || value || undefined,
    osInfo: segments.find((segment) => segment.startsWith('('))?.replace(/[()]/g, '') || undefined
  }
}

export async function POST(request: Request, { params }: { params: { orgSlug: string } }) {
  const { accessToken, user } = await withAuth()

  if (!user || !accessToken) {
    return NextResponse.json({ code: 'unauthorized', message: 'Sign in required' }, { status: 401 })
  }

  try {
    await ensureWorkspace(accessToken, user)

    const body = await request.json()

    if (typeof body?.description !== 'string' || !body.description.trim()) {
      return NextResponse.json({ code: 'unprocessable', message: 'Feedback description is required.' }, { status: 422 })
    }

    if (typeof body?.feedback_type !== 'string') {
      return NextResponse.json({ code: 'unprocessable', message: 'Feedback type is required.' }, { status: 422 })
    }

    if (typeof body?.current_url !== 'string' || !body.current_url) {
      return NextResponse.json({ code: 'unprocessable', message: 'The current url is required.' }, { status: 422 })
    }

    const { browserInfo, osInfo } = parseUserAgent(request)

    await createLegacyFeedback(accessToken, {
      slug: params.orgSlug,
      description: body.description,
      feedbackType:
        body.feedback_type === 'feature' || body.feedback_type === 'general' ? body.feedback_type : 'bug',
      currentUrl: body.current_url,
      screenshotPath: typeof body.screenshot_path === 'string' ? body.screenshot_path : undefined,
      browserInfo,
      osInfo
    })

    return NextResponse.json({}, { status: 201 })
  } catch (error) {
    return routeErrorResponse(error)
  }
}
