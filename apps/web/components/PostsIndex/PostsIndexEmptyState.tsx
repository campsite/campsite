import { useRouter } from 'next/router'

import { PostIcon } from '@campsite/ui/Icons'
import { UIText } from '@campsite/ui/Text'

import { IndexPageEmptyState } from '@/components/IndexPages/components'
import { NewProjectPostButton } from '@/components/Projects/NewProjectPostButton'

export function PostsIndexEmptyState({ isWriteableForViewer = true }: { isWriteableForViewer?: boolean }) {
  const router = useRouter()
  const projectId = router.query.projectId as string | undefined

  return (
    <IndexPageEmptyState>
      <PostIcon size={32} />
      <div className='flex flex-col gap-1'>
        <UIText size='text-base' weight='font-semibold'>
          {isWriteableForViewer ? 'Write a post' : 'No posts yet'}
        </UIText>
        {isWriteableForViewer && (
          <UIText size='text-base' tertiary>
            Share an update, ask a question, or get feedback on an idea.
          </UIText>
        )}
      </div>
      {isWriteableForViewer && <NewProjectPostButton projectId={projectId} variant='primary' />}
    </IndexPageEmptyState>
  )
}
