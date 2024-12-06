import { BlogMDX } from 'app/blog/_components/BlogMdx'
import { BlogMoreWriting } from 'app/blog/_components/BlogMoreWriting'
import { FooterCTA } from 'app/blog/_components/FooterCTA'
import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { BlogPosting, WithContext } from 'schema-dts'

import { SITE_URL } from '@campsite/config'
import { cn } from '@campsite/ui/src/utils/cn'

import { HorizontalRule } from '@/components/Home/HorizontalRule'
import { PageTitle } from '@/components/Layouts/PageHead'
import { WidthContainer } from '@/components/Layouts/WidthContainer'
import { getBlogs } from '@/lib/blog'
import { enhanceContributor } from '@/lib/changelog'

export async function generateStaticParams() {
  return getBlogs().map((blog) => ({ slug: blog.slug }))
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const blog = getBlogs().find((blog) => blog.slug === params.slug)

  if (!blog) notFound()

  const title = `${blog.metadata.title} · Campsite`
  const description = blog.metadata.description
  const publishedTime = blog.metadata.publishedAt
  const image = blog.ogImage

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
      url: blog.url,
      images: [image]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image]
    }
  }
}

export default function Blog({ params }: { params: { slug: string } }) {
  const blogs = getBlogs()
  const currentBlog = blogs.find((blog) => blog.slug === params.slug)
  const recentBlogs = blogs.filter((blog) => blog.slug !== params.slug).slice(0, 5)

  if (!currentBlog) notFound()

  const author = enhanceContributor(currentBlog.metadata.author)

  const jsonLd: WithContext<BlogPosting> = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: currentBlog.metadata.title,
    datePublished: currentBlog.metadata.publishedAt,
    dateModified: currentBlog.metadata.publishedAt,
    description: currentBlog.metadata.description,
    image: currentBlog.ogImage.url,
    url: currentBlog.url,
    author: author
      ? {
          '@type': 'Person',
          name: author.name,
          image: author.avatarAbsoluteUrl
        }
      : undefined
  }

  return (
    <section>
      <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <WidthContainer className='max-w-3xl gap-12 py-16 lg:py-24'>
        <div className='flex flex-col gap-4 lg:gap-2'>
          <Link href='/blog' className='text-quaternary hover:text-primary self-start lg:mb-4'>
            <span className='font-mono'>←</span> Back to Field Guide
          </Link>

          <div className='flex flex-col gap-6 lg:gap-8'>
            <PageTitle className='text-[clamp(2.4rem,_5vw,_3.4rem)] leading-[1.1]'>
              {currentBlog.metadata.title}
            </PageTitle>
            {author && (
              <Link href={author.twitter} target='_blank' className='flex items-center gap-3 self-start'>
                <Image
                  src={author.avatarRelativeUrl}
                  alt={author.name}
                  width={88}
                  height={88}
                  className='h-11 w-11 rounded-full'
                />

                <div className='flex flex-1 flex-col justify-center gap-0'>
                  <p className='text-primary text-base lg:text-lg lg:leading-tight'>{author.name}</p>
                  <p className='text-quaternary text-sm lg:text-base'>{author.role}</p>
                </div>
              </Link>
            )}
          </div>
        </div>

        <article
          className={cn(
            'prose prose-lg prose-changelog w-full max-w-full leading-relaxed',
            'prose-a:!text-blue-500 prose-a:!font-normal prose-a:!no-underline'
          )}
        >
          <BlogMDX source={currentBlog.content} />
        </article>

        <p className='text-quaternary text-base lg:text-lg'>
          Published{' '}
          {new Date(currentBlog.metadata.publishedAt).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
          })}
        </p>
      </WidthContainer>

      <WidthContainer className='max-w-3xl gap-4 pb-16'>
        <BlogMoreWriting blogs={recentBlogs} />
      </WidthContainer>

      <HorizontalRule />
      <FooterCTA />
    </section>
  )
}
