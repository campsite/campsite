import { withAuth } from '@workos-inc/authkit-nextjs'
import { NextResponse } from 'next/server'

import { getLegacyPublicProjectByToken } from '@/lib/convex/onboarding'

export async function GET(_: Request, { params }: { params: { token: string } }) {
  const { accessToken } = await withAuth()
  const project = await getLegacyPublicProjectByToken(accessToken, { token: params.token })

  if (!project) {
    return NextResponse.json({ code: 'not_found', message: 'Project not found' }, { status: 404 })
  }

  return NextResponse.json(project)
}
