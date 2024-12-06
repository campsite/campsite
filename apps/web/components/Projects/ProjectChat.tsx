/* eslint-disable max-lines */

import { useEffect } from 'react'

import { Project } from '@campsite/types'

import { FullPageError } from '@/components/Error'
import { PROJECT_PAGE_SCROLL_CONTAINER_ID } from '@/components/Projects/utils'
import { ScrollableContainer } from '@/components/ScrollableContainer'
import { ThreadView } from '@/components/ThreadView'
import { useCreateProjectView } from '@/hooks/useCreateProjectView'

export function ProjectChat({ project }: { project: Project }) {
  const threadId = project.message_thread_id
  const { mutate: createProjectView } = useCreateProjectView()

  useEffect(() => {
    createProjectView({ projectId: project.id })
  }, [createProjectView, project.id])

  if (!threadId) {
    return <FullPageError message='This project does not support chat' />
  }

  return (
    <>
      <ScrollableContainer id={PROJECT_PAGE_SCROLL_CONTAINER_ID} className='scroll-p-2'>
        <ThreadView threadId={threadId} />
      </ScrollableContainer>
    </>
  )
}
