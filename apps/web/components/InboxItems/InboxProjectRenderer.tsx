import { QuestionMarkIcon } from '@campsite/ui/Icons'
import { LazyLoadingSpinner } from '@campsite/ui/Spinner'

import { CopyCurrentUrl } from '@/components/CopyCurrentUrl'
import { EmptyState } from '@/components/EmptyState'
import { InboxProjectPreviewCard } from '@/components/InboxItems/InboxProjectPreviewCard'
import { useGetProject } from '@/hooks/useGetProject'

interface InboxProjectRendererProps {
  projectId: string
}

export function InboxProjectRenderer({ projectId }: InboxProjectRendererProps) {
  const { data: project, isFetching, isError } = useGetProject({ id: projectId, enabled: !!projectId })

  if (isFetching) {
    return (
      <div className='bg-secondary dark:bg-primary flex flex-1 items-center justify-center p-6'>
        <LazyLoadingSpinner />
      </div>
    )
  }

  if (isError || !project) {
    return (
      <div className='bg-secondary dark:bg-primary flex flex-1 items-center justify-center p-6'>
        <EmptyState
          icon={<QuestionMarkIcon size={32} />}
          title='Something went wrong'
          message='The project may have been deleted or you may not have access to it.'
        />
      </div>
    )
  }

  return (
    <>
      <CopyCurrentUrl override={project.url} />
      <InboxProjectPreviewCard project={project} />
    </>
  )
}
