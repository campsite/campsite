import { getSignInUrl } from '@workos-inc/authkit-nextjs'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function encodeAuthState(data: { desktop: boolean; from?: string | null }) {
  return Buffer.from(
    JSON.stringify({
      desktop: data.desktop,
      from: data.from || null
    })
  ).toString('base64url')
}

export async function GET(request: Request) {
  const searchParams = new URL(request.url).searchParams
  const isDesktop = searchParams.get('desktop') === 'true'
  const returnTo = '/callback'
  const state = encodeAuthState({
    desktop: isDesktop,
    from: searchParams.get('from')
  })
  const signInUrl = await getSignInUrl({
    returnTo,
    state,
    redirectUri: process.env.WORKOS_REDIRECT_URI || process.env.NEXT_PUBLIC_WORKOS_REDIRECT_URI
  })

  return redirect(signInUrl)
}
