import React from 'react'
import { AnimatePresence, m } from 'framer-motion'

import { cn } from '@campsite/ui/utils'

interface CommentLayoutTransitionContainerProps extends React.PropsWithChildren {
  initial: boolean
  show: boolean
  className?: string
}

function CommentLayoutTransitionContainer({
  children,
  initial,
  show,
  className
}: CommentLayoutTransitionContainerProps) {
  return (
    <AnimatePresence initial={initial}>
      {show && (
        <m.div
          className={cn('bg-elevated dark:bg-secondary overflow-hidden', className)}
          initial={{ height: 0 }}
          animate={{ height: 'auto' }}
          exit={{ height: 0 }}
        >
          <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {children}
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  )
}

interface CommentInnerLayoutTransitionContainerProps extends React.PropsWithChildren {
  initial: boolean
  show: boolean
}

function CommentInnerLayoutTransitionContainer({
  children,
  initial,
  show
}: CommentInnerLayoutTransitionContainerProps) {
  return (
    <AnimatePresence initial={initial}>
      {show && (
        <m.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </m.div>
      )}
    </AnimatePresence>
  )
}

export { CommentLayoutTransitionContainer, CommentInnerLayoutTransitionContainer }
