'use client'

import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'
import NextError from 'next/error'

/**
 * @see https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/#react-render-errors-in-app-router
 */
export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html>
      <body>
        <NextError statusCode={500} />
      </body>
    </html>
  )
}
