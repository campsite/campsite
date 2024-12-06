import { EmojiMartData } from '@emoji-mart/data'

import { GroupedReaction, SyncCustomReaction } from '@campsite/types'

import { isStandardReactionSkin, ReactionData } from './data'

export interface StandardReaction {
  id: string
  name: string
  native: string
}

export function isStandardReaction(reaction: StandardReaction | SyncCustomReaction): reaction is StandardReaction {
  return (reaction as StandardReaction).native !== undefined
}

export function getStandardReaction(reaction: StandardReaction | SyncCustomReaction): StandardReaction | undefined {
  if (isStandardReaction(reaction)) return reaction
  return undefined
}

export function getCustomReaction(reaction: StandardReaction | SyncCustomReaction): SyncCustomReaction | undefined {
  if (!isStandardReaction(reaction)) return reaction
  return undefined
}

export function hasReacted(
  groupedReactions: GroupedReaction[],
  reaction: StandardReaction | SyncCustomReaction
): boolean {
  return groupedReactions.some((groupedReaction) => {
    if (!groupedReaction.viewer_reaction_id) return false
    if (isStandardReaction(reaction)) return reaction.native === groupedReaction.emoji
    return reaction.id === groupedReaction.custom_content?.id
  })
}

export function isExistingReaction(
  groupedReaction: GroupedReaction,
  reaction: StandardReaction | SyncCustomReaction
): boolean {
  if (isStandardReaction(reaction)) return reaction.native === groupedReaction.emoji
  return reaction.id === groupedReaction.custom_content?.id
}

export function findGroupedReaction(
  groupedReactions: GroupedReaction[],
  reaction: StandardReaction | SyncCustomReaction
): GroupedReaction | undefined {
  return groupedReactions.find((groupedReaction) => isExistingReaction(groupedReaction, reaction))
}

export function findEmojiMartEmoji(emojiMartData: EmojiMartData, nativeEmoji: string) {
  return Object.values(emojiMartData.emojis).find((emoji) => emoji.skins.some((skin) => skin.native === nativeEmoji))
}

export function formatReactionName(name: string): string {
  return `:${name.toLowerCase().replaceAll(' ', '_')}:`
}

export function formatReactionData(reactionData: ReactionData): StandardReaction | SyncCustomReaction {
  const skin = reactionData.skins[0]

  if (isStandardReactionSkin(skin)) {
    return {
      id: reactionData.id,
      name: reactionData.name,
      native: skin.native
    }
  }

  return {
    id: reactionData.id,
    name: reactionData.name,
    file_url: skin.file_url,
    created_at: skin.created_at
  }
}
