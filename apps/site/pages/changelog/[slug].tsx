import { FooterCTA } from 'app/blog/_components/FooterCTA'
import { GetStaticPropsContext } from 'next'
import { NextSeo } from 'next-seo'
import Head from 'next/head'

import { SITE_URL } from '@campsite/config'

import { ChangelogDetail } from '@/components/Changelog/ChangelogDetail'
import { HorizontalRule } from '@/components/Home/HorizontalRule'
import { WidthContainer } from '@/components/Layouts/WidthContainer'
import { getChangelog } from '@/lib/changelog'
import { Changelog } from '@/types/index'

interface Props {
  data: Changelog
}

export default function ChangelogPage(props: Props) {
  const { data } = props

  return (
    <>
      <Head>
        <link rel='alternate' type='application/rss+xml' title='RSS feed' href={`${SITE_URL}/changelog/rss`} />
      </Head>

      <NextSeo
        title={`${data.data.title} · Campsite`}
        description={`Released on ${data.data.date}`}
        canonical={`${SITE_URL}/changelog/${data.data.slug}`}
        openGraph={{
          title: `${data.data.title} · Campsite`,
          description: `Released on ${data.data.date}`,
          images: data.data.feature_image
            ? [
                {
                  url: data.data.feature_image,
                  alt: `Feature image for ${data.data.title}`
                }
              ]
            : [
                {
                  url: `${SITE_URL}/og/default.png`,
                  alt: `Feature image for ${data.data.title}`
                }
              ]
        }}
      />

      <WidthContainer className='max-w-3xl py-16 lg:py-24'>
        <ChangelogDetail changelog={data} />
      </WidthContainer>

      <HorizontalRule />
      <FooterCTA />
    </>
  )
}

export async function getStaticPaths() {
  const data = await getChangelog()
  const paths = data.map((c) => ({ params: { slug: c.data.slug } }))

  return {
    paths,
    fallback: false
  }
}

export async function getStaticProps(context: GetStaticPropsContext) {
  const slug = context.params?.slug
  const all = await getChangelog()
  const data = all.find((c) => c.data.slug === slug)

  return {
    props: {
      data
    }
  }
}
