type ReactionCategoryType =
  | 'frequent'
  | 'custom'
  | 'people'
  | 'nature'
  | 'foods'
  | 'activity'
  | 'places'
  | 'objects'
  | 'symbols'
  | 'flags'

interface StandardReactionSkin {
  unified: string
  native: string
}

interface CustomReactionSkin {
  file_url: string
  created_at: string
}

interface ReactionsCategory {
  id: ReactionCategoryType
  reactionIds: string[]
}

interface ReactionData {
  id: string
  name: string
  keywords: string[]
  emoticons: string[]
  skins: (StandardReactionSkin | CustomReactionSkin)[]
}

interface ReactionsData {
  aliases: { [key: string]: string }
  emoticons: { [key: string]: string }
  categories: ReactionsCategory[]
  reactions: { [key: string]: ReactionData }
}

const ALL_REACTION_CATEGORIES: Readonly<ReactionCategoryType[]> = [
  'frequent',
  'custom',
  'people',
  'nature',
  'foods',
  'activity',
  'places',
  'objects',
  'symbols',
  'flags'
]

function getReactionCategoryLabel(id: string) {
  switch (id) {
    case 'search':
      return 'Search Results'
    case 'frequent':
      return 'Frequently Used'
    case 'custom':
      return 'Custom'
    case 'people':
      return 'Smileys & People'
    case 'nature':
      return 'Animals & Nature'
    case 'foods':
      return 'Food & Drink'
    case 'activity':
      return 'Activity'
    case 'places':
      return 'Travel & Places'
    case 'objects':
      return 'Objects'
    case 'symbols':
      return 'Symbols'
    case 'flags':
      return 'Flags'
    default:
      return id
  }
}

function isStandardReactionSkin(skin: StandardReactionSkin | CustomReactionSkin): skin is StandardReactionSkin {
  return (skin as StandardReactionSkin).unified !== undefined
}

export { ALL_REACTION_CATEGORIES, getReactionCategoryLabel, isStandardReactionSkin }
export type { ReactionCategoryType, ReactionData, ReactionsCategory, ReactionsData }
