import { DefaultSeo } from 'next-seo'
import Head from 'next/head'

import { DEFAULT_SEO } from '@campsite/config'

export function SEO() {
  return (
    <>
      <DefaultSeo {...DEFAULT_SEO} />
      <Head>
        <link rel='icon' href='/favicon.ico' sizes='any' />
        <link rel='icon' href='/favicon.svg' type='image/svg+xml' sizes='any' />
        <link rel='apple-touch-icon' href='/meta/apple-touch-icon.png' />
        <link rel='manifest' href='/meta/manifest.webmanifest' />
        <meta name='theme-color' content='#fff' media='(prefers-color-scheme: light)' />
        <meta name='theme-color' content='rgb(23, 23, 23)' media='(prefers-color-scheme: dark)' />
      </Head>
    </>
  )
}
