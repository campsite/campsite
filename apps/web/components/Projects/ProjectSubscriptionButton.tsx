import { useState } from 'react'

import { Project } from '@campsite/types'
import { BellCheckIcon, BellIcon, Button } from '@campsite/ui'

import { ProjectNotificationsDialog } from '@/components/Projects/ProjectDialogs/ProjectNotificationsDialog'

interface Props {
  project: Project
}

export function ProjectSubscriptionButton({ project }: Props) {
  const isSubscribed = project.viewer_has_subscribed
  const [notificationsDialogOpen, setNotificationsDialogOpen] = useState(false)

  /**
   * Allow users to un/subscribe projects if they are a member.
   * Don't show the button if the project is archived.
   */
  if (!project.viewer_is_member || project.archived) return null

  return (
    <>
      <ProjectNotificationsDialog
        project={project}
        open={notificationsDialogOpen}
        onOpenChange={setNotificationsDialogOpen}
      />
      <Button
        variant={project.viewer_has_subscribed ? 'flat' : 'base'}
        iconOnly={isSubscribed ? <BellCheckIcon /> : <BellIcon />}
        onClick={() => setNotificationsDialogOpen(true)}
        tooltip={isSubscribed ? 'Disable notifications' : 'Enable notifications'}
        accessibilityLabel={isSubscribed ? 'Disable notifications' : 'Enable notifications'}
      />
    </>
  )
}
