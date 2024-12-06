import { useEffect, useState } from 'react'
import { animate, AnimatePresence, m, MotionValue, useMotionValue, useTransform } from 'framer-motion'
import { useWatch } from 'react-hook-form'
import { api } from 'src/api'
import { FormSchema } from 'src/core/schema'

import { Avatar, CheckIcon } from '@campsite/ui'
import { cn } from '@campsite/ui/src/utils'

export interface ProgressIndicatorProps {
  progress: MotionValue<number>
  onAnimationEnd(): void
}

export function ProgressIndicator({ progress, onAnimationEnd }: ProgressIndicatorProps) {
  const { organization } = useWatch<FormSchema>()
  const { data: organizations } = api.organizations.useGetAllQuery()
  const currentOrganization = organizations?.find((o) => o.slug === organization)

  const radius = 50
  const circumference = 2 * Math.PI * (radius - 0.75)
  const dashOffset = useTransform(progress, (v) => circumference * (1 - v))

  const [complete, setComplete] = useState(false)
  const scale = useMotionValue(1)

  useEffect(() => {
    progress.on('change', (v) => {
      if (v === 1) {
        setComplete(true)
        animate(scale, 0.8, {
          type: 'tween',
          ease: [0, 0.55, 0.45, 1],
          duration: 0.1,
          onComplete() {
            animate(scale, 1, {
              type: 'tween',
              ease: [0, 0.55, 0.45, 1],
              duration: 0.25,
              onComplete() {
                onAnimationEnd()
              }
            })
          }
        })
      }
    })
  }, [progress, scale, onAnimationEnd])

  return (
    <div className='relative p-5'>
      <m.div
        className='absolute inset-0'
        animate={complete ? 'complete' : undefined}
        variants={{
          complete: {
            scale: 0.6,
            opacity: 0
          }
        }}
        transition={{
          type: 'tween',
          duration: 0.15,
          opacity: {
            duration: 0.1
          }
        }}
      >
        <svg viewBox={`0 0 ${radius * 2} ${radius * 2}`} xmlns='http://www.w3.org/2000/svg'>
          <defs>
            <mask id='progress-path'>
              <circle cx={radius} cy={radius} r={radius} fill='white' />
              <circle cx={radius} cy={radius} r={radius - 1.5} fill='black' />
            </mask>
          </defs>

          <circle
            cx={radius}
            cy={radius}
            r={radius}
            className='text-primary fill-current'
            opacity={0.2}
            mask='url(#progress-path)'
          />

          <m.circle
            cx={radius}
            cy={radius}
            r={radius - 0.75}
            className='text-primary fill-none stroke-current'
            strokeWidth='1.5'
            strokeLinecap='round'
            transform={`rotate(-90,${radius},${radius})`}
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            mask='url(#progress-path)'
          />
        </svg>
      </m.div>

      <m.div className='relative' style={{ scale }}>
        <Avatar size='xxl' name={currentOrganization?.name} urls={currentOrganization?.avatar_urls} />
        <AnimatePresence>
          {complete && (
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1, duration: 0 }}
              className={cn(
                'from-brand-primary to-brand-secondary absolute inset-0 flex items-center justify-center rounded-full bg-gradient-to-b'
              )}
            >
              <CheckIcon size={72} className='text-white dark:text-black' />
            </m.div>
          )}
        </AnimatePresence>
      </m.div>
    </div>
  )
}
