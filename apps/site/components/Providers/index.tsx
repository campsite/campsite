'use client'

import { Suspense } from 'react'
import { domAnimation, LazyMotion } from 'framer-motion'
import { ThemeProvider as Theme } from 'next-themes'
import { Provider as BalanceProvider } from 'react-wrap-balancer'
import { Toaster } from 'sonner'

import { CookieReferrerProvider } from '@/components/Providers/CookieReferrerProvider'
import { SEO } from '@/components/Providers/SEO'

import { PageLayout } from '../Layouts'

interface ProvidersProps extends React.PropsWithChildren {
  router: 'pages' | 'app'
}

export default function Providers({ children, router }: ProvidersProps) {
  return (
    <>
      {router === 'pages' && <SEO />}

      <LazyMotion features={domAnimation}>
        <Theme attribute='class'>
          <BalanceProvider>
            <PageLayout>{children}</PageLayout>

            <Suspense>
              <Toaster />
              <CookieReferrerProvider />
            </Suspense>
          </BalanceProvider>
        </Theme>
      </LazyMotion>
    </>
  )
}
