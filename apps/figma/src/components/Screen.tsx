import { PropsWithChildren } from 'react'
import { m } from 'framer-motion'

export interface ScreenProps extends PropsWithChildren<{}> {}

export function Screen({ children }: ScreenProps) {
  return (
    <m.div
      className='absolute inset-0 flex flex-1 flex-col'
      initial={{
        scale: 1.5,
        opacity: 0
      }}
      animate={{
        scale: 1,
        opacity: 1
      }}
      exit={{
        scale: 0.75,
        opacity: 0
      }}
      transition={{
        type: 'tween',
        ease: [0.16, 1, 0.3, 1],
        duration: 0.35,
        opacity: { duration: 0.1 }
      }}
    >
      {children}
    </m.div>
  )
}
