import * as Sentry from '@sentry/nextjs'
// eslint-disable-next-line no-restricted-imports
import { ErrorBoundaryProps, ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary'

const logError = (error: Error) => {
  Sentry.captureException(error)
}

export const ErrorBoundary = (props: ErrorBoundaryProps) => <ReactErrorBoundary onError={logError} {...props} />
