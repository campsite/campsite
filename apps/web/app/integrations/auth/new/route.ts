import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function appendCallbackParams(rawRedirectUri: string, successPath?: string | null, enableNotifications?: boolean) {
  const redirectUri = new URL(rawRedirectUri)

  if (successPath) {
    redirectUri.searchParams.set('campsite_success_path', successPath)
  }

  if (enableNotifications) {
    redirectUri.searchParams.set('enable_notifications', 'true')
  }

  return redirectUri.toString()
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const authUrl = requestUrl.searchParams.get('auth_url')

  if (!authUrl) {
    return NextResponse.redirect(new URL('/login', requestUrl))
  }

  const successPath = requestUrl.searchParams.get('success_path')
  const enableNotifications = requestUrl.searchParams.get('enable_notifications') === 'true'
  const targetUrl = new URL(authUrl)
  const redirectUri = targetUrl.searchParams.get('redirect_uri')

  if (redirectUri) {
    targetUrl.searchParams.set(
      'redirect_uri',
      appendCallbackParams(redirectUri, successPath, enableNotifications)
    )
  }

  return NextResponse.redirect(targetUrl)
}
