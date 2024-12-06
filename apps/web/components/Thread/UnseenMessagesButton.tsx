import { AnimatePresence, m } from 'framer-motion'

import { UIText } from '@campsite/ui'

interface Props {
  active: boolean
  onClick: () => void
}

export function UnseenMessagesButton({ active, onClick }: Props) {
  return (
    <AnimatePresence>
      {active && (
        <m.button
          transition={{
            duration: 0.2
          }}
          initial={{
            opacity: 0,
            y: -44,
            left: '50%',
            translateX: '-50%'
          }}
          animate={{
            opacity: 1,
            y: -56
          }}
          exit={{
            opacity: 0,
            y: -44
          }}
          onClick={onClick}
          className='bg-elevated text-primary absolute bottom-2 z-10 flex transform-gpu items-center justify-center rounded-full border px-4 py-2 shadow dark:border-0 dark:shadow-[inset_0px_1px_0px_rgba(255,255,255,0.04),_0px_2px_12px_rgba(0,0,0,0.4),_0px_0px_0px_1px_rgba(0,0,0,0.8)]'
        >
          <UIText weight='font-bold' inherit size='text-xs'>
            New messages
          </UIText>
        </m.button>
      )}
    </AnimatePresence>
  )
}
