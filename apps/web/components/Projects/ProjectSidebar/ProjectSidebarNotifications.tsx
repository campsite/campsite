import { Project } from '@campsite/types'
import { Select, SelectTrigger, SelectValue } from '@campsite/ui'
import { BellIcon, BellOffIcon, PostPlusIcon } from '@campsite/ui/Icons'
import { UIText } from '@campsite/ui/Text'

import { ThreadNotificationsSettingsSelect } from '@/components/Thread/ThreadNotificationsSettingsSelect'
import { useCreateProjectSubscription } from '@/hooks/useCreateProjectSubscription'
import { useDeleteProjectSubscription } from '@/hooks/useDeleteProjectSubscription'

// ----------------------------------------------------------------------------

function NotificationSelect({ project }: { project: Project }) {
  const subscription = project.viewer_subscription
  const createProjectSubscription = useCreateProjectSubscription(project.id)
  const deleteProjectSubscription = useDeleteProjectSubscription(project.id)

  function handleChange(newValue: string) {
    if (newValue === 'none') {
      deleteProjectSubscription.mutate()
    } else if (newValue === 'new_posts') {
      createProjectSubscription.mutate({ cascade: false })
    } else if (newValue === 'posts_and_comments') {
      createProjectSubscription.mutate({ cascade: true })
    }
  }

  return (
    <Select
      value={subscription}
      options={[
        {
          label: 'Posts and comments',
          sublabel: 'Notify me about every new post and comment — I don’t want to miss anything.',
          leftSlot: <BellIcon />,
          value: 'posts_and_comments'
        },
        {
          label: 'New posts',
          sublabel: 'Notify me when someone shares a new post.',
          leftSlot: <PostPlusIcon />,
          value: 'new_posts'
        },
        {
          label: 'None',
          sublabel: 'Only notify me when mentioned.',
          leftSlot: <BellOffIcon />,
          value: 'none'
        }
      ]}
      onChange={handleChange}
    >
      <SelectTrigger>
        <SelectValue placeholder='Subscription' />
      </SelectTrigger>
    </Select>
  )
}

// ----------------------------------------------------------------------------

interface ProjectSidebarNotificationsProps {
  project: Project
}

function ProjectSidebarNotifications({ project }: ProjectSidebarNotificationsProps) {
  if (!project.viewer_is_member) return null

  return (
    <div className='flex w-full flex-col'>
      <div className='flex flex-col gap-3 border-b px-4 py-4'>
        <UIText size='text-xs' tertiary weight='font-medium'>
          Notifications
        </UIText>
        {project.message_thread_id ? (
          <ThreadNotificationsSettingsSelect threadId={project.message_thread_id} />
        ) : (
          <NotificationSelect project={project} />
        )}
      </div>
    </div>
  )
}

// ----------------------------------------------------------------------------

export { ProjectSidebarNotifications }
