import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import { animate, AnimatePresence, m, useMotionValue } from 'framer-motion'
import { useCommand } from 'src/core/command-context'
import { LAYOUT_TRANSITION } from 'src/core/motion'

import { Post } from '@campsite/types/generated'
import { ArrowLeftIcon, Button } from '@campsite/ui'

import { ProgressIndicator } from './ProgressIndicator'
import { Screen } from './Screen'
import { SharePrompt } from './SharePrompt'

export interface ProgressScreenProps {
  onDone(): void
}

export interface ProgressScreenRef {
  value: number
  setPost(post: Post): void
}

export const ProgressScreen = forwardRef<ProgressScreenRef, ProgressScreenProps>(function ProgressScreen(
  { onDone },
  ref
) {
  const command = useCommand()

  const [post, setPost] = useState<Post | null>(null)
  const progress = useMotionValue(0)
  const [animationComplete, setAnimationComplete] = useState(false)

  useImperativeHandle(ref, () => {
    return {
      _value: 0,
      get value() {
        return this._value
      },
      set value(next: number) {
        this._value = next
        animate(progress, next, {
          type: 'tween',
          duration: 0.3
        })
      },
      setPost
    }
  }, [progress, setPost])

  return (
    <Screen>
      <div className='flex flex-1 flex-col'>
        <AnimatePresence>
          {animationComplete && (
            <m.div
              className='flex p-2'
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={LAYOUT_TRANSITION}
            >
              <Button accessibilityLabel='Done' iconOnly={<ArrowLeftIcon />} variant='plain' onClick={() => onDone()} />
            </m.div>
          )}
        </AnimatePresence>

        <m.div layout transition={LAYOUT_TRANSITION} className='flex flex-1' />
        <m.div
          layout='position'
          transition={LAYOUT_TRANSITION}
          className='flex flex-col items-center justify-center gap-2'
        >
          <ProgressIndicator progress={progress} onAnimationEnd={() => setAnimationComplete(true)} />
        </m.div>
        <m.div layout transition={LAYOUT_TRANSITION} className='flex flex-1' />

        <AnimatePresence>
          {animationComplete && (
            <m.div
              className='flex w-full flex-col items-center gap-2.5 p-4'
              layout
              initial={{
                opacity: 0,
                y: '25%'
              }}
              animate={{
                opacity: 1,
                y: 0
              }}
              transition={LAYOUT_TRANSITION}
            >
              {post && <SharePrompt post={post} />}
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </Screen>
  )
})
