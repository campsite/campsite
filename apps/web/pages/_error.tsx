import * as Sentry from '@sentry/nextjs'
import { NextPage } from 'next'
import NextErrorComponent from 'next/error'

import InternalErrorPage from '@/pages/500'

/**
 * This page is loaded by Nextjs:
 *  - on the server, when data-fetching methods throw or reject
 *  - on the client, when `getInitialProps` throws or rejects
 *  - on the client, when a React lifecycle method throws or rejects, and it's
 *    caught by the built-in Nextjs error boundary
 *
 * See:
 *  - https://nextjs.org/docs/basic-features/data-fetching/overview
 *  - https://nextjs.org/docs/api-reference/data-fetching/get-initial-props
 *  - https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary
 */

const MyError: NextPage = () => {
  return <InternalErrorPage message='Try reloading, or get in touch with us if this issue persists.' />
}

MyError.getInitialProps = async (contextData) => {
  // In case this is running in a serverless function, await this in order to give Sentry
  // time to send the error before the lambda exits
  await Sentry.captureUnderscoreErrorException(contextData)

  // This will contain the status code of the response
  return NextErrorComponent.getInitialProps(contextData)
}

export default MyError
