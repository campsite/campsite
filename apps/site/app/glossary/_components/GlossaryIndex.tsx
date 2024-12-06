'use client'

import { FooterCTA } from 'app/blog/_components/FooterCTA'
import { type SanityDocument } from 'next-sanity'
import Image from 'next/image'
import Link from 'next/link'

import { cn, UIText } from '@campsite/ui'

import { HorizontalRule } from '@/components/Home/HorizontalRule'
import { PageTitle } from '@/components/Layouts/PageHead'
import { WidthContainer } from '@/components/Layouts/WidthContainer'

export function GlossaryIndex({ posts }: { posts: SanityDocument[] }) {
  return (
    <>
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

          <PageTitle className='text-[clamp(2.4rem,_5vw,_3.4rem)] leading-[1.1]'>Slack glossary</PageTitle>
        </div>

        <ul className='flex flex-col gap-y-1'>
          {posts.map((post) => (
            <li
              key={post._id}
              className={cn(
                'text-primary lg:px-4.5 lg:-mx-4.5 relative isolate flex w-full flex-1 cursor-pointer select-none scroll-m-1 items-center gap-3 rounded-lg outline-none ease-in-out will-change-[background,_color] lg:py-3.5 lg:hover:bg-black/5 lg:dark:hover:bg-white/10',
                {
                  'bg-transparent dark:bg-transparent': true
                }
              )}
            >
              <Link href={`/glossary/slack/${post.slug.current}`} className='absolute inset-0 z-50' />

              <div className='flex flex-1 flex-col gap-1 lg:flex-row lg:items-center lg:gap-3'>
                <UIText
                  size='text-lg lg:text-xl'
                  primary
                  weight='font-medium'
                  className='break-anywhere mr-2 line-clamp-2 flex-1 text-balance leading-snug'
                >
                  {post.title}
                </UIText>
              </div>
            </li>
          ))}
        </ul>
      </WidthContainer>
      <HorizontalRule />
      <FooterCTA />
    </>
  )
}
