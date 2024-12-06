import { SubjectFollowUp } from '@campsite/types/generated'
import { FollowUpTag } from '@campsite/ui/FollowUpTag'

interface ViewerFollowUpTagProps {
  followUps: SubjectFollowUp[]
}

export function ViewerFollowUpTag({ followUps }: ViewerFollowUpTagProps) {
  const viewerFollowUp = followUps.find((followUp) => followUp.belongs_to_viewer)

  return <FollowUpTag followUpAt={viewerFollowUp?.show_at} />
}
