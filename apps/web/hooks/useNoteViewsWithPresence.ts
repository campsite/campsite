import { useMemo, useState } from 'react'

import { Note } from '@campsite/types'

import { useGetNoteViews } from './useGetNoteViews'
import { useUsersPresence } from './useUsersPresence'

export function useNoteViewsWithPresence(noteId: string, note?: Note) {
  const { data: views } = useGetNoteViews({ noteId })
  const [userIds, setUserIds] = useState<Set<string>>(new Set())

  useUsersPresence({ channelName: note?.presence_channel_name, setUserIds })

  return useMemo(
    () =>
      views
        ?.sort((a, b) => {
          const aIsOnline = userIds.has(a.member.user.id)
          const bIsOnline = userIds.has(b.member.user.id)

          if (aIsOnline && !bIsOnline) return -1
          if (!aIsOnline && bIsOnline) return 1
          return 0
        })
        .map((view) => ({
          ...view.member,
          user: {
            ...view.member.user,
            isPresent: userIds.has(view.member.user.id)
          }
        })) ?? [],
    [userIds, views]
  )
}
