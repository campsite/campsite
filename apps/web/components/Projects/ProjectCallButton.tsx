import { Project } from '@campsite/types/generated'
import { Button, ButtonProps } from '@campsite/ui/Button'
import { LayeredHotkeys } from '@campsite/ui/DismissibleLayer'
import { VideoCameraIcon } from '@campsite/ui/Icons'

import { useGetThread } from '@/hooks/useGetThread'
import { useJoinMessageThreadCall } from '@/hooks/useJoinMessageThreadCall'

interface Props extends ButtonProps {
  project: Pick<Project, 'message_thread_id'>
  hotkey?: boolean
}

export function ProjectCallButton({ project, hotkey = false, ...buttonProps }: Props) {
  // TODO: Support calls in post projects.
  // https://linear.app/campsite/project/calls-in-channels-9f829815473a/overview
  const { data: thread } = useGetThread({ threadId: project?.message_thread_id })
  const { joinCall, canJoin, onCall } = useJoinMessageThreadCall({ thread })
  const label = onCall ? 'Already joined call' : 'Start call'

  if (!canJoin && !onCall) return null

  return (
    <>
      {hotkey && (
        <LayeredHotkeys
          keys='mod+shift+h'
          callback={joinCall}
          options={{ preventDefault: true, enableOnContentEditable: true }}
        />
      )}

      <Button
        accessibilityLabel='Start call'
        tooltip={buttonProps?.iconOnly ? label : undefined}
        tooltipShortcut={hotkey ? '⌘+shift+H' : undefined}
        onClick={joinCall}
        disabled={onCall}
        {...buttonProps}
      >
        {buttonProps.children || (!buttonProps.iconOnly && label)}
      </Button>
    </>
  )
}

export function BreadcrumbProjectCallButton({ project }: Props) {
  return <ProjectCallButton project={project} variant='plain' hotkey iconOnly={<VideoCameraIcon size={24} />} />
}
