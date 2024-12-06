import { m } from 'framer-motion'

import { cn } from '@campsite/ui/src/utils'

export function DevModeBanner() {
  const isProd = process.env.NEXT_PUBLIC_VERCEL_ENV === 'production'

  if (isProd) return null

  return (
    <m.div className={cn('border-brand-primary fixed left-0 right-0 top-0 z-40 border-t-2')}>
      <div className='bg-brand-primary fixed left-1/2 -translate-x-1/2 rounded-b-md px-2.5 pb-0.5 text-center font-mono text-[10px] font-bold uppercase tracking-wider text-white'>
        Dev
      </div>
    </m.div>
  )
}
