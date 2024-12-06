import { Project } from '@campsite/types/generated'
import { PinTackFilledIcon } from '@campsite/ui/Icons'
import { UIText } from '@campsite/ui/Text'
import { cn } from '@campsite/ui/utils'

import { CompactCallRow } from '@/components/Calls'
import { CompactPost } from '@/components/CompactPost/CompactPost'
import { NoteRow } from '@/components/NotesIndex/NoteRow'
import { useIsSplitViewAvailable } from '@/components/SplitView/hooks'
import { useCurrentUserOrOrganizationHasFeature } from '@/hooks/useCurrentUserOrOrganizationHasFeature'
import { useGetProjectPins } from '@/hooks/useGetProjectPins'
import { usePostsDisplayPreference } from '@/hooks/usePostsDisplayPreference'

interface ProjectPinnedFeedProps {
  project: Project
}

export function ProjectPinnedFeed({ project }: ProjectPinnedFeedProps) {
  const displayPreference = usePostsDisplayPreference()
  const { isSplitViewAvailable } = useIsSplitViewAvailable()
  const hasComfyCompactLayout = useCurrentUserOrOrganizationHasFeature('comfy_compact_layout')
  const getPins = useGetProjectPins({ id: project.id })

  if (!getPins.data?.data.length) return null

  return (
    <div
      className={cn({
        'mb-4 border-b pb-4': !isSplitViewAvailable && !hasComfyCompactLayout && displayPreference === 'comfortable'
      })}
    >
      <div className='flex items-center gap-4 py-2'>
        <div className='text-brand-primary flex items-center gap-2'>
          <PinTackFilledIcon size={16} />
          <UIText weight='font-medium' inherit>
            Pinned
          </UIText>
        </div>
        <div className='flex-1 border-b' />
      </div>

      <ul className='@container -mx-2 flex flex-col gap-px py-2'>
        {getPins.data.data.map(({ post, note, call }) => {
          if (post) {
            return <CompactPost key={post.id} post={post} display='pinned' hideProject />
          } else if (note) {
            return <NoteRow key={note.id} note={note} display='pinned' hideProject />
          } else if (call) {
            return <CompactCallRow key={call.id} call={call} display='pinned' hideProject />
          }
        })}
      </ul>
    </div>
  )
}
