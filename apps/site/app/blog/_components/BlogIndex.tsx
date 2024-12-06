'use client'

import { BlogMoreWriting } from 'app/blog/_components/BlogMoreWriting'
import { FooterCTA } from 'app/blog/_components/FooterCTA'
import Image from 'next/image'
import { Blog as BlogJsonLd, WithContext } from 'schema-dts'

import { SITE_URL } from '@campsite/config'
import { cn, Link, LinkedInIcon, ThreadsIcon, UIText, XIcon } from '@campsite/ui'

import { HorizontalRule } from '@/components/Home/HorizontalRule'
import { PageHead } from '@/components/Layouts/PageHead'
import { WidthContainer } from '@/components/Layouts/WidthContainer'
import { Blog } from '@/lib/blog'

const BLOG_INDEX_TITLE = 'Field Guide'
const BLOG_INDEX_DESCRIPTION = 'Notes and best-practices for effective distributed team communication'

export function BlogIndex({ blogs }: { blogs: Blog[] }) {
  const pinnedBlog = blogs.find((blog) => blog.metadata.pinned)
  const notPinnedBlogs = blogs.filter((blog) => !blog.metadata.pinned)

  const jsonLd: WithContext<BlogJsonLd> = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: BLOG_INDEX_TITLE,
    description: BLOG_INDEX_DESCRIPTION,
    url: `${SITE_URL}/blog`,
    image: `${SITE_URL}/og/default.png`
  }

  return (
    <>
      <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <WidthContainer className='3xl:pt-32 4xl:pt-36 items-center gap-4 pt-12 md:pt-16 lg:pt-20 xl:pt-24 2xl:pt-28'>
        <PageHead title={BLOG_INDEX_TITLE} subtitle={BLOG_INDEX_DESCRIPTION} />

        <div className='mt-4 flex flex-wrap items-center gap-6'>
          <Link className='text-tertiary hover:text-primary text-sm' href='/follow'>
            <XIcon />
          </Link>
          <Link className='text-tertiary hover:text-primary text-sm' href='/follow/threads'>
            <ThreadsIcon />
          </Link>
          <Link className='text-tertiary hover:text-primary text-sm' href='/follow/linkedin'>
            <LinkedInIcon />
          </Link>
        </div>
      </WidthContainer>

      <WidthContainer className='mt-8 lg:mt-12 2xl:mt-20'>
        <div className='grid min-h-[500px] grid-cols-1 grid-rows-1 gap-4 md:grid-cols-2 md:grid-rows-2'>
          {pinnedBlog && <FeatureBlog className='md:row-span-2' blog={pinnedBlog} />}

          {notPinnedBlogs.slice(0, 2).map((blog) => (
            <FeatureBlog key={blog.slug} blog={blog} />
          ))}
        </div>
      </WidthContainer>

      <WidthContainer className='py-8 lg:py-12'>
        <BlogMoreWriting blogs={notPinnedBlogs.slice(2)} />
      </WidthContainer>

      <HorizontalRule />
      <FooterCTA />
    </>
  )
}

function FeatureBlog({ blog, className }: { blog: Blog; className?: string }) {
  return (
    <div
      className={cn(
        'bg-secondary relative flex overflow-hidden rounded-2xl shadow-[inset_0px_1px_0px_rgb(255_255_255_/_0.08),_inset_0px_0px_0px_0.5px_rgb(255_255_255_/_0.02),_0px_0px_0px_1px_rgb(0_0_0_/_0.06)] md:col-span-1 dark:shadow-none',
        blog.metadata.pinned && 'min-h-[300px]',
        className
      )}
    >
      <Link href={`/blog/${blog.slug}`} className='absolute inset-0 z-50' />

      {(blog.metadata.posterLight || blog.metadata.posterDark) && (
        <div className='absolute inset-0 z-[4] h-full'>
          {blog.metadata.posterLight && (
            <Image
              draggable={false}
              src={blog.metadata.posterLight ?? ''}
              width={680}
              height={400}
              alt={blog.metadata.posterAlt ?? blog.metadata.title}
              className='block h-full w-full select-none border-0 object-cover outline-none dark:hidden'
            />
          )}
          {blog.metadata.posterDark && (
            <Image
              draggable={false}
              src={blog.metadata.posterDark ?? ''}
              width={680}
              height={400}
              alt={blog.metadata.posterAlt ?? blog.metadata.title}
              className='hidden h-full w-full select-none border-0 object-cover outline-none dark:block'
            />
          )}
        </div>
      )}

      {/* image scrim */}
      {(blog.metadata.posterLight || blog.metadata.posterDark) && (
        <div className='absolute inset-0 z-[5] bg-gradient-to-t from-white to-white/80 dark:from-gray-900 dark:to-gray-900/80' />
      )}

      {/* gray scrim */}
      {!blog.metadata.posterLight && blog.metadata.posterDark && (
        <div className='absolute inset-0 z-[5] bg-gradient-to-t from-gray-100 to-gray-100/80 dark:from-gray-900 dark:to-gray-900/80' />
      )}

      <div className='relative z-[11] flex flex-col justify-end gap-1 p-4 lg:p-6'>
        {blog.metadata.pinned && (
          <UIText size='text-base' weight='font-medium' className='text-brand-primary line-clamp-3 text-balance'>
            Start here
          </UIText>
        )}
        <p className='text-balance text-xl font-semibold leading-snug 2xl:text-2xl'>{blog.metadata.title}</p>
        <p className='text-secondary line-clamp-2 text-balance text-lg'>{blog.metadata.description}</p>
        {!blog.metadata.pinned && (
          <UIText size='text-base' quaternary className='line-clamp-3 text-balance'>
            {new Date(blog.metadata.publishedAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </UIText>
        )}
      </div>
    </div>
  )
}
