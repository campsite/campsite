import { useEffect, useState } from 'react'

import { cn, LoadingSpinner } from '@campsite/ui'

export function FullPageLoading() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const timeout = setTimeout(() => {
      setShow(true)
    }, 500)

    return () => {
      clearTimeout(timeout)
    }
  }, [])

  return (
    <div
      className={cn('flex w-full flex-1 items-center justify-center', {
        'opacity-0': !show
      })}
    >
      <LoadingSpinner />
    </div>
  )
}
