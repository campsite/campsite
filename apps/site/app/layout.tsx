import { Inter } from 'next/font/google'

import '@campsite/ui/src/styles/global.css'
import '@campsite/ui/src/styles/code.css'
import 'styles/global.css'

import { Metadata } from 'next'

import { DEFAULT_SEO } from '@campsite/config'

import Providers from '@/components/Providers'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter'
})

export const metadata: Metadata = DEFAULT_SEO

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en' suppressHydrationWarning className={inter.variable}>
      <body className='bg-primary dark:bg-neutral-950'>
        <span className='sr-only'>
          <a href='#main'>Skip to content</a>
          <a href='#list'>jump to list</a>
        </span>

        <Providers router='app'>{children}</Providers>
      </body>
    </html>
  )
}
