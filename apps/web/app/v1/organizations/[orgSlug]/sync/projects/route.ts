import { withAuth } from '@workos-inc/authkit-nextjs'
import { NextResponse } from 'next/server'

import { getLegacySyncProjects } from '@/lib/convex/onboarding'
import { ensureWorkspace } from '@/lib/convex/server'

export async function GET(_: Request, { params }: { params: { orgSlug: string } }) {
  const { accessToken, user } = await withAuth()

  if (!user || !accessToken) {
    return NextResponse.json([])
  }

  await ensureWorkspace(accessToken, user)

  return NextResponse.json(await getLegacySyncProjects(accessToken, { slug: params.orgSlug }))
}
