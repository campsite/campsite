import * as Sentry from '@sentry/nextjs'

import { Button, DebugButton as UIDebugButton } from '@campsite/ui'

import { DebugButton } from '@/components/DebugButton'

export default function InternalErrorTestPage() {
  return (
    <div className='flex h-full w-full flex-col items-center justify-center space-y-4'>
      <Button
        onClick={() => {
          throw new Error('Throw Exception Test 💥')
        }}
      >
        Throw from in-page
      </Button>

      <UIDebugButton />
      <DebugButton />

      <Button
        onClick={() => {
          Sentry.captureException(new Error('Capture Exception Test 💣'))
        }}
      >
        Capture exception 💣
      </Button>
    </div>
  )
}
