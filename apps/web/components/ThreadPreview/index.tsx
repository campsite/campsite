import { useEffect, useRef, useState } from 'react'

import { cn } from '@campsite/ui/src/utils'

interface Props {
  className?: string
  postId: string
  username: string
}

export function ThreadPreview({ className, postId, username }: Props) {
  const [height, setHeight] = useState(400)
  const ref = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    // catch Threads iframe messages that send height to the parent
    const messageHandler = (event: MessageEvent) => {
      if (event.origin === 'https://www.threads.net' && ref.current?.contentWindow === event.source) {
        setHeight(event.data)
      }
    }

    window.addEventListener('message', messageHandler)

    return () => {
      window.removeEventListener('message', messageHandler)
    }
  }, [])

  return (
    <div className='relative w-full transition-all active:scale-[0.99]'>
      <iframe
        ref={ref}
        className={cn('w-full overflow-hidden rounded-xl', className)}
        allowFullScreen
        src={`https://www.threads.net/@${username}/post/${postId}/embed`}
        data-text-app-payload-id={`ig-tp-${postId}`}
        sandbox='allow-scripts allow-same-origin allow-popups'
        height={height}
        scrolling='no'
      />
      <div className={cn('absolute inset-0 overflow-hidden rounded-xl', className)}>
        <div className={cn('pointer-events-none absolute inset-0 rounded-xl border border-[white]')} />
      </div>
      <div className={cn('pointer-events-none absolute inset-0 rounded-xl border border-[--bg-primary]', className)} />
      <div className={cn('pointer-events-none absolute inset-0 rounded-xl border', className)} />
    </div>
  )
}
