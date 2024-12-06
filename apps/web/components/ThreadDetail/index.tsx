import { useRouter } from 'next/router'

import { ThreadView } from '@/components/ThreadView'
import { ThreadViewTitlebar } from '@/components/ThreadView/ThreadViewTitlebar'

export function ThreadDetail() {
  const router = useRouter()
  const isFocus = router.query.focus === 'true'
  const { threadId } = router.query

  if (!threadId) {
    return <div className='text-quaternary flex flex-1 items-center justify-center'>Select a conversation</div>
  }

  return (
    <div className='flex flex-1 flex-col overflow-hidden'>
      <ThreadViewTitlebar threadId={threadId as string} isFocus={isFocus} />
      <ThreadView threadId={threadId as string} />
    </div>
  )
}
