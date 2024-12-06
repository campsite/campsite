import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'

import { cn } from '@campsite/ui/src/utils'

import { Changelog } from '@/types/index'

interface Props {
  changelog: Changelog
}

export default function ChangelogListItem(props: Props) {
  const router = useRouter()
  const changelogIndex = !router.query.slug
  const { changelog } = props

  return (
    <li className='flex w-full flex-col gap-6 border-b py-8 first:pt-0 last-of-type:border-b-0 md:py-12 lg:gap-8 lg:border-transparent lg:py-16 2xl:py-20'>
      {!changelogIndex && (
        <Link href='/changelog' className='text-quaternary hover:text-primary mb-2'>
          <span className='font-mono'>←</span> Back to changelog
        </Link>
      )}

      {changelog.data.feature_image && (
        <Link href={`/changelog/${changelog.data.slug}`} className='flex'>
          <Image
            alt={`Feature image for ${changelog.data.title}`}
            src={changelog.data.feature_image}
            width={1200}
            height={600}
            className='flex aspect-[2/1] w-full rounded-lg object-cover ring-1 ring-black ring-opacity-5 dark:ring-white/10'
          />
        </Link>
      )}

      <div className='flex flex-col'>
        {changelogIndex ? (
          <h2 className='text-[clamp(1.4rem,_4vw,_1.7rem)] font-semibold'>
            <Link href={`/changelog/${changelog.data.slug}`}>{changelog.data.title}</Link>
          </h2>
        ) : (
          <h1 className='mb-1 text-[clamp(2rem,_4vw,_2.8rem)] font-bold leading-[1.12]'>{changelog.data.title}</h1>
        )}

        <Link
          className={cn({
            'text-quaternary text-[clamp(1.3rem,_3vw,_1.5rem)]': !changelogIndex,
            'text-quaternary text-[clamp(1rem,_3vw,_1.2rem)]': changelogIndex
          })}
          href={`/changelog/${changelog.data.slug}`}
        >
          {changelog.data.date}
        </Link>
      </div>

      {changelog.content && (
        <ReactMarkdown
          className='prose prose-lg prose-changelog w-full max-w-full'
          rehypePlugins={[rehypeRaw]}
          remarkPlugins={[remarkGfm]}
        >
          {changelog.content}
        </ReactMarkdown>
      )}
    </li>
  )
}
