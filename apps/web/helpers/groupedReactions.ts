import { CurrentUser, GroupedReaction, SyncCustomReaction } from '@campsite/types'

import { notEmpty } from '@/utils/notEmpty'
import {
  findGroupedReaction,
  getCustomReaction,
  getStandardReaction,
  isExistingReaction,
  StandardReaction
} from '@/utils/reactions'

export function removeGroupedReactionByEmoji({
  grouped_reactions,
  reaction_id,
  display_name
}: {
  grouped_reactions: GroupedReaction[]
  reaction_id: string
  display_name: string
}): GroupedReaction[] {
  return grouped_reactions
    .map((r) => {
      if (r.viewer_reaction_id !== reaction_id) return r
      const newReactionsCount = r.reactions_count - 1

      if (newReactionsCount > 0) {
        const newTooltip = r.tooltip.split(', ').filter((name) => name !== display_name)

        return {
          ...r,
          viewer_reaction_id: null,
          reactions_count: r.reactions_count - 1,
          tooltip: newTooltip.join(', ')
        }
      }
    })
    .filter(notEmpty)
}

export function addGroupedReaction({
  grouped_reactions,
  viewer_reaction_id,
  reaction,
  currentUser
}: {
  grouped_reactions: GroupedReaction[]
  viewer_reaction_id: string
  reaction: StandardReaction | SyncCustomReaction
  currentUser: CurrentUser
}): GroupedReaction[] {
  const existingGroupedReaction = findGroupedReaction(grouped_reactions, reaction)

  if (existingGroupedReaction) {
    return grouped_reactions.map((r) => {
      if (!isExistingReaction(r, reaction)) return r

      return {
        ...r,
        viewer_reaction_id: viewer_reaction_id,
        reactions_count: r.reactions_count + 1,
        tooltip: `${r.tooltip}, ${currentUser.display_name}`
      }
    })
  }

  return [
    ...grouped_reactions,
    {
      viewer_reaction_id: viewer_reaction_id,
      emoji: getStandardReaction(reaction)?.native ?? null,
      custom_content: getCustomReaction(reaction) ?? null,
      reactions_count: 1,
      tooltip: currentUser.display_name
    }
  ]
}

export function updateGroupedReaction({
  grouped_reactions,
  id,
  data
}: {
  grouped_reactions: GroupedReaction[]
  id: string
  data: Partial<GroupedReaction>
}): GroupedReaction[] {
  return grouped_reactions.map((r) => {
    if (r.viewer_reaction_id !== id) return r

    return {
      ...r,
      ...data
    }
  })
}
