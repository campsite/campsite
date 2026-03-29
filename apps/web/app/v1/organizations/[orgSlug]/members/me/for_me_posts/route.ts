import { withAuth } from '@workos-inc/authkit-nextjs'
import { NextResponse } from 'next/server'

import { ensureWorkspace, getLegacyOrganization, getLegacyPostsPage } from '@/lib/convex/server'

export async function GET(request: Request, { params }: { params: { orgSlug: string } }) {
  const { accessToken, user } = await withAuth()

  if (!user || !accessToken) {
    return NextResponse.json({ code: 'unauthorized', message: 'Sign in required' }, { status: 401 })
  }

  await ensureWorkspace(accessToken, user)
  const organization = await getLegacyOrganization(accessToken, params.orgSlug)

  if (!organization) {
    return NextResponse.json({ code: 'not_found', message: 'Organization not found' }, { status: 404 })
  }

  const searchParams = new URL(request.url).searchParams

  return NextResponse.json(
    await getLegacyPostsPage(accessToken, {
      slug: params.orgSlug,
      q: searchParams.get('q') || undefined,
      limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined,
      mode: 'for_me'
    })
  )
}
