import Image from 'next/image'
import Link from 'next/link'

export function Testimonial({
  byline,
  avatar,
  link,
  children
}: {
  byline: string
  link: string
  avatar: string
  children: React.ReactNode
}) {
  return (
    <div className='before:bg-quaternary relative flex flex-col gap-4 pb-2 pl-5 pt-1 before:absolute before:bottom-0 before:left-0 before:top-0 before:w-[3px] before:rounded-full'>
      <p className='text-quaternary dark:text-tertiary text-[clamp(0.9375rem,_2vw,_1.0625rem)] leading-relaxed'>
        {children}
      </p>
      <Link href={link} target='_blank' className='group/link flex items-center gap-3 self-start rounded-full'>
        <Image
          src={avatar}
          width={24}
          height={24}
          alt={byline}
          className='rounded-full saturate-0 group-hover/link:saturate-100'
        />
        <p className='text-quaternary group-hover/link:text-secondary text-[clamp(0.9375rem,_2vw,_1.0625rem)]'>
          {byline}
        </p>
      </Link>
    </div>
  )
}
