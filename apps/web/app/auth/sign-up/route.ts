import { getSignUpUrl } from '@workos-inc/authkit-nextjs'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: Request) {
  const searchParams = new URL(request.url).searchParams
  const returnTo = '/auth/complete'
  const state = searchParams.get('from') || undefined
  const signUpUrl = await getSignUpUrl({
    returnTo,
    state,
    redirectUri: process.env.WORKOS_REDIRECT_URI || process.env.NEXT_PUBLIC_WORKOS_REDIRECT_URI
  })

  return redirect(signUpUrl)
}
