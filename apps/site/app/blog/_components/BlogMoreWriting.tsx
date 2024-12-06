'use client'

import { cn, Link, UIText } from '@campsite/ui'

import { Blog } from '@/lib/blog'

interface BlogMoreWritingProps {
  blogs: Blog[]
}

export function BlogMoreWriting({ blogs }: BlogMoreWritingProps) {
  return (
    <>
      <div className='text-brand-primary flex items-center gap-4 py-2'>
        <UIText weight='font-medium' size='text-base lg:text-lg' inherit>
          More writing
        </UIText>
        <div className='flex-1 border-b' />
      </div>
      <div className='flex flex-col gap-5 py-2 lg:gap-px lg:px-0'>
        {blogs.map((blog) => (
          <div
            key={blog.slug}
            className={cn(
              'text-primary lg:px-4.5 lg:-mx-4.5 relative isolate flex w-full flex-1 cursor-pointer select-none scroll-m-1 items-center gap-3 rounded-lg outline-none ease-in-out will-change-[background,_color] lg:py-3.5 lg:hover:bg-black/5 lg:dark:hover:bg-white/10',
              {
                'bg-transparent dark:bg-transparent': true
              }
            )}
          >
            <Link href={`/blog/${blog.slug}`} className='absolute inset-0 z-50' />

            <div className='flex flex-1 flex-col gap-1 lg:flex-row lg:items-center lg:gap-3'>
              <UIText
                size='text-lg lg:text-xl'
                primary
                weight='font-medium'
                className='break-anywhere mr-2 line-clamp-2 flex-1 text-balance leading-snug'
              >
                {blog.metadata.title}
              </UIText>

              <UIText size='text-base lg:text-xl' quaternary>
                {new Date(blog.metadata.publishedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </UIText>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
