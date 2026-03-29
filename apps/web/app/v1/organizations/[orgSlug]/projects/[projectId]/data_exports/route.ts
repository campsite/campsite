import { withAuth } from '@workos-inc/authkit-nextjs'
import { NextResponse } from 'next/server'

import { createLegacyProjectDataExport } from '@/lib/convex/adminOps'
import { ensureWorkspace } from '@/lib/convex/server'
import { routeErrorResponse } from '@/lib/routeErrors'

export async function POST(_: Request, { params }: { params: { orgSlug: string; projectId: string } }) {
  const { accessToken, user } = await withAuth()

  if (!user || !accessToken) {
    return NextResponse.json({ code: 'unauthorized', message: 'Sign in required' }, { status: 401 })
  }

  try {
    await ensureWorkspace(accessToken, user)
    await createLegacyProjectDataExport(accessToken, {
      slug: params.orgSlug,
      projectId: params.projectId
    })

    return NextResponse.json({})
  } catch (error) {
    return routeErrorResponse(error)
  }
}
