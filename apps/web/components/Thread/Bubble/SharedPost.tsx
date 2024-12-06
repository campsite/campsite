import { Link } from '@campsite/ui'

interface Props {
  url: string
}

export function SharedPost({ url }: Props) {
  return (
    <div className='ring-primary h-5.5 bg-primary flex flex-wrap items-center rounded-full px-px shadow-sm ring-2'>
      <Link
        href={url}
        className='h-5.5 bg-tertiary hover:bg-quaternary group pointer-events-auto flex min-w-[32px] items-center justify-center rounded-full px-2 text-[11px] font-medium ring-1'
      >
        View post
      </Link>
    </div>
  )
}
