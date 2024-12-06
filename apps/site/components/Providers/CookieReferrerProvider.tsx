'use client'

import { useEffect } from 'react'
import { hasCookie, setCookie } from 'cookies-next'

/**
 * Set referrer and landing url cookies to track where new users are coming from
 */
export function CookieReferrerProvider() {
  useEffect(() => {
    if (!hasCookie('referrer')) {
      const referrer = document.referrer || 'direct'
      const landingUrl = window.location.href
      const thirtyDays = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
      const domain = `.${window.location.hostname.replace('www.', '')}`

      setCookie('referrer', referrer, {
        path: '/',
        sameSite: 'lax',
        secure: process.env.NEXT_PUBLIC_VERCEL_ENV === 'production',
        expires: thirtyDays,
        domain
      })
      setCookie('landing_url', landingUrl, {
        path: '/',
        sameSite: 'lax',
        secure: process.env.NEXT_PUBLIC_VERCEL_ENV === 'production',
        expires: thirtyDays,
        domain
      })
    }
  }, [])

  return null
}
