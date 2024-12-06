import { NextSeo } from 'next-seo'
import Head from 'next/head'
import Link from 'next/link'

import { SITE_URL } from '@campsite/config'
import { LinkedInIcon, RSSIcon, ThreadsIcon, XIcon } from '@campsite/ui'

import { PageHead } from '@/components/Layouts/PageHead'

import { WidthContainer } from '../Layouts/WidthContainer'
import { ChangelogPagination } from './ChangelogPagination'

interface Props {
  children: React.ReactNode
  hasNextPage?: boolean
  hasPreviousPage?: boolean
  nextPage?: number | null
  previousPage?: number | null
}

export default function ChangelogPageComponent(props: Props) {
  return (
    <>
      <Head>
        <link rel='alternate' type='application/rss+xml' title='RSS feed' href={`${SITE_URL}/changelog/rss`} />
      </Head>

      <NextSeo
        title='Changelog · Campsite'
        description='Our latest features and updates.'
        canonical={`${SITE_URL}/changelog`}
      />

      <WidthContainer className='3xl:pt-32 4xl:pt-36 gap-4 pt-12 md:pt-16 lg:pt-20 xl:pt-24 2xl:pt-28'>
        <PageHead title='Changelog' subtitle='Our latest features and updates' />

        <div className='mt-4 flex flex-wrap gap-6 lg:justify-center'>
          <Link className='text-tertiary hover:text-primary text-sm' href='/follow'>
            <XIcon />
          </Link>
          <Link className='text-tertiary hover:text-primary text-sm' href='/follow/threads'>
            <ThreadsIcon />
          </Link>
          <Link className='text-tertiary hover:text-primary text-sm' href='/follow/linkedin'>
            <LinkedInIcon />
          </Link>
          <Link className='text-tertiary hover:text-primary text-sm' href='/changelog/rss'>
            <RSSIcon strokeWidth='2' size={24} />
          </Link>
        </div>
      </WidthContainer>

      <WidthContainer className='flex max-w-3xl flex-col gap-12 pb-16 pt-16 lg:pb-24'>
        {props.children}
        <ChangelogPagination {...props} />
      </WidthContainer>
    </>
  )
}
