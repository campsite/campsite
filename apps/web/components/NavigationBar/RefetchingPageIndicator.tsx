import { m } from 'framer-motion'

import { LoadingSpinner } from '@campsite/ui/Spinner'

export function RefetchingPageIndicator({ isRefetching }: { isRefetching: boolean }) {
  return (
    <m.div
      initial={{ height: 0, opacity: 0 }}
      animate={{
        height: isRefetching ? 64 : 0,
        opacity: isRefetching ? 1 : 0
      }}
      exit={{ height: 0, opacity: 0 }}
      className='pointer-events-none flex flex-none items-center justify-center'
    >
      <LoadingSpinner />
    </m.div>
  )
}
