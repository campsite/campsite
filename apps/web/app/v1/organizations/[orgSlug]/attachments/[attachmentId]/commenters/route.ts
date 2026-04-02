import { withAuth } from '@workos-inc/authkit-nextjs'
import { NextResponse } from 'next/server'

import { ensureWorkspace, getLegacyAttachmentCommenters, getLegacyOrganization } from '@/lib/convex/server'

export async function GET(_: Request, { params }: { params: { orgSlug: string; attachmentId: string } }) {
  const { accessToken, user } = await withAuth()

  if (!user || !accessToken) {
    return NextResponse.json({ code: 'unauthorized', message: 'Sign in required' }, { status: 401 })
  }

  await ensureWorkspace(accessToken, user)
  const organization = await getLegacyOrganization(accessToken, params.orgSlug)

  if (!organization) {
    return NextResponse.json({ code: 'not_found', message: 'Organization not found' }, { status: 404 })
  }

  return NextResponse.json(
    await getLegacyAttachmentCommenters(accessToken, {
      slug: params.orgSlug,
      attachmentId: params.attachmentId
    })
  )
}
