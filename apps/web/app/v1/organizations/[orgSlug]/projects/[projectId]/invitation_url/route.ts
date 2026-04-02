import { withAuth } from '@workos-inc/authkit-nextjs'
import { NextResponse } from 'next/server'

import { normalizeInvitationUrl } from '@/lib/convex/compat'
import { getLegacyProjectInvitationUrl, resetLegacyProjectInvitationUrl } from '@/lib/convex/onboarding'
import { ensureWorkspace } from '@/lib/convex/server'
import { routeErrorResponse } from '@/lib/routeErrors'

export async function GET(_: Request, { params }: { params: { orgSlug: string; projectId: string } }) {
  const { accessToken, user } = await withAuth()

  if (!user || !accessToken) {
    return NextResponse.json({ code: 'unauthorized', message: 'Sign in required' }, { status: 401 })
  }

  try {
    await ensureWorkspace(accessToken, user)

    const invitationUrl = await getLegacyProjectInvitationUrl(accessToken, {
      slug: params.orgSlug,
      projectId: params.projectId
    })

    if (!invitationUrl?.invitation_url) {
      return NextResponse.json(
        normalizeInvitationUrl(
          await resetLegacyProjectInvitationUrl(accessToken, {
            slug: params.orgSlug,
            projectId: params.projectId
          })
        )
      )
    }

    return NextResponse.json(normalizeInvitationUrl(invitationUrl))
  } catch (error) {
    return routeErrorResponse(error)
  }
}

export async function POST(_: Request, { params }: { params: { orgSlug: string; projectId: string } }) {
  const { accessToken, user } = await withAuth()

  if (!user || !accessToken) {
    return NextResponse.json({ code: 'unauthorized', message: 'Sign in required' }, { status: 401 })
  }

  try {
    await ensureWorkspace(accessToken, user)

    return NextResponse.json(
      normalizeInvitationUrl(
        await resetLegacyProjectInvitationUrl(accessToken, {
          slug: params.orgSlug,
          projectId: params.projectId
        })
      )
    )
  } catch (error) {
    return routeErrorResponse(error)
  }
}
