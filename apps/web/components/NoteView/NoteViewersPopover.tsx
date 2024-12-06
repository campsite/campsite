import { useMemo, useState } from 'react'
import { AnimatePresence, m } from 'framer-motion'
import pluralize from 'pluralize'

import { Note } from '@campsite/types/generated'
import {
  ANIMATION_CONSTANTS,
  Button,
  CONTAINER_STYLES,
  GlobeIcon,
  Popover,
  PopoverContent,
  PopoverPortal,
  PopoverTrigger,
  UIText
} from '@campsite/ui'
import { cn } from '@campsite/ui/src/utils'

import { FacePile } from '@/components/FacePile'
import { FollowUps } from '@/components/FollowUp'
import { ViewLink } from '@/components/Post/PostViewersPopover'
import { useGetCurrentUser } from '@/hooks/useGetCurrentUser'
import { useGetNoteViews } from '@/hooks/useGetNoteViews'
import { useNoteViewsWithPresence } from '@/hooks/useNoteViewsWithPresence'

interface Props {
  note: Note
}

export function NoteViewersPopover({ note }: Props) {
  const [open, setOpen] = useState(false)
  const { data: currentUser } = useGetCurrentUser()
  const viewMembers = useNoteViewsWithPresence(note.id, note)

  const facepileUsers = useMemo(() => {
    const followUpFacepileUsers = note.follow_ups.map((f) => f.member.user) || []
    const followUpFacepileUserIds = new Set(followUpFacepileUsers.map((user) => user.id))
    const viewFacepileUsers =
      viewMembers
        ?.map((view) => view.user)
        .filter((user) => !!user)
        .filter((u) => !followUpFacepileUserIds.has(u.id)) || []

    return [...viewFacepileUsers, ...followUpFacepileUsers]
  }, [note.follow_ups, viewMembers])

  if (!currentUser?.logged_in) return null
  if (viewMembers.length === 0 && note.follow_ups.length === 0) return null
  if (!facepileUsers.length) return null

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button round onClick={() => setOpen(true)} variant='plain' className='px-1.5'>
          <FacePile users={facepileUsers} size='xs' showIsPresent showTooltip={false} />
        </Button>
      </PopoverTrigger>
      <AnimatePresence>
        {open && (
          <PopoverPortal forceMount>
            <PopoverContent
              avoidCollisions
              className='w-[320px]'
              asChild
              forceMount
              side='bottom'
              align='end'
              sideOffset={8}
            >
              <m.div
                {...ANIMATION_CONSTANTS}
                className={cn(
                  CONTAINER_STYLES.base,
                  CONTAINER_STYLES.shadows,
                  'bg-elevated rounded-lg dark:border dark:bg-clip-border'
                )}
              >
                <div className='scrollbar-hide flex max-h-[400px] flex-col gap-0.5 overflow-y-scroll'>
                  <FollowUps showBorder followUps={note.follow_ups} />

                  <Views note={note} />
                </div>
              </m.div>
            </PopoverContent>
          </PopoverPortal>
        )}
      </AnimatePresence>
    </Popover>
  )
}

function Views({ note }: { note: Note }) {
  const { data: viewsData, isError, isLoading } = useGetNoteViews({ noteId: note.id, enabled: true })

  const nonMemberViewersDescriptor =
    note.non_member_views_count > 0
      ? `${note.non_member_views_count} anonymous ${pluralize('view', note.non_member_views_count)}`
      : null

  if (isLoading || isError) return null
  if (!viewsData || viewsData.length === 0) return null

  return (
    <div className='p-1.5'>
      <div className='p-2'>
        <UIText size='text-xs' weight='font-medium' tertiary>
          Seen by
        </UIText>
      </div>

      {note.non_member_views_count > 0 && (
        <div className='flex items-center gap-2 px-2 py-1.5'>
          <div className='flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 text-blue-400 dark:bg-blue-900/50'>
            <GlobeIcon />
          </div>
          <UIText>{nonMemberViewersDescriptor}</UIText>
        </div>
      )}

      {viewsData &&
        !!viewsData.length &&
        viewsData.map((view) => <ViewLink key={view.member.id} member={view.member} time={view.updated_at} />)}
    </div>
  )
}
