import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

import { LAST_CLIENT_JS_BUILD_ID_LS_KEY } from '@campsite/config'
import { RefreshIcon, UIText } from '@campsite/ui'

import { useHasLatestBuild } from '@/hooks/useHasLatestBuild'
import { useStoredState } from '@/hooks/useStoredState'

export function RefreshAppBanner() {
  const [isVisible, setIsVisible] = useState(false)
  const hasLatestBuild = useHasLatestBuild()

  const [lsLastChecked] = useStoredState<number | null>(LAST_CLIENT_JS_BUILD_ID_LS_KEY, null)

  useEffect(() => {
    const oneDay = 1000 * 60 * 60 * 24
    const now = new Date().getTime()
    const staleRefresh = now - (lsLastChecked || 0) > oneDay

    if (staleRefresh && !hasLatestBuild) setIsVisible(true)
  }, [hasLatestBuild, lsLastChecked])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, height: 0, top: 2, scale: 0.95 }}
          animate={{ opacity: 1, height: 'auto', top: 0, scale: 1 }}
          exit={{ opacity: 0, height: 0, top: 2, scale: 0.95 }}
          transition={{ duration: 0.3 }}
        >
          <button
            onClick={() => window.location.reload()}
            className='flex w-full flex-1 items-center justify-center py-2'
          >
            <div className='bg-elevated text-primary flex items-center gap-1.5 rounded-full py-0.5 pl-2 pr-3 shadow-sm ring-1 ring-black/5 transition-all hover:shadow-md dark:bg-gray-800'>
              <RefreshIcon className='text-brand-primary' />
              <UIText size='text-xs' weight='font-semibold' inherit>
                App update available
              </UIText>
            </div>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
