import { BlogMDX } from 'app/blog/_components/BlogMdx'
import { FooterCTA } from 'app/blog/_components/FooterCTA'
import { Metadata } from 'next'
import { type SanityDocument } from 'next-sanity'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { BlogPosting, WithContext } from 'schema-dts'

import { SITE_URL } from '@campsite/config'

import { HorizontalRule } from '@/components/Home/HorizontalRule'
import { PageTitle } from '@/components/Layouts/PageHead'
import { WidthContainer } from '@/components/Layouts/WidthContainer'
import { getOgImageMetadata } from '@/lib/og'
import { client } from '@/sanity/client'

const POST_QUERY = `*[_type == "glossary" && slug.current == $slug][0]`

const options = { next: { revalidate: 30 } }

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await client.fetch<SanityDocument>(POST_QUERY, params, options)

  if (!post) notFound()

  const title = `${post.title} · Campsite`
  const description = post.shortDescription
  const publishedTime = post.publishedAt
  const ogImage = getOgImageMetadata(post.title)

  return {
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical: './'
    },
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime,
      url: `${SITE_URL}/glossary/slack/${post.slug.current}`,
      images: [ogImage]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage]
    }
  }
}

export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = await client.fetch<SanityDocument>(POST_QUERY, params, options)

  const jsonLd: WithContext<BlogPosting> = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    datePublished: post.publishedAt,
    dateModified: post._updatedAt,
    description: post.description,
    url: `${SITE_URL}/glossary/slack/${post.slug.current}`,
    author: undefined
  }

  return (
    <section>
      <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <WidthContainer className='max-w-3xl gap-8 py-16 lg:py-24'>
        <div className='flex flex-col gap-4'>
          <Image
            draggable={false}
            src='/img/slack-app-icon.png'
            width={112}
            height={112}
            alt='Slack app icon'
            className='h-16 w-16 -translate-x-1.5 select-none lg:h-32 lg:w-32'
          />

          <Link href='/glossary/slack' className='text-quaternary hover:text-primary self-start lg:mb-4'>
            <span className='font-mono'>←</span> Back to Slack glossary
          </Link>

          <PageTitle className='text-[clamp(2.4rem,_5vw,_3.4rem)] leading-[1.1]'>{post.title}</PageTitle>
        </div>

        <article className='prose prose-lg prose-changelog prose-a:!text-blue-500 prose-a:!font-normal prose-a:!no-underline w-full max-w-full leading-relaxed'>
          <BlogMDX source={post.markdown} />
        </article>
      </WidthContainer>
      <HorizontalRule />
      <FooterCTA />
    </section>
  )
}
