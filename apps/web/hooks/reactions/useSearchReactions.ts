import { useMemo } from 'react'

import { SyncCustomReaction } from '@campsite/types/generated'
import { commandScore } from '@campsite/ui/utils'

import { formatReactionData, StandardReaction } from '@/utils/reactions'
import { isStandardReactionSkin, ReactionData } from '@/utils/reactions/data'

import { useReactionsData } from './useReactionsData'

export function useSearchReactions(
  query: string,
  { maxResults = 10, hideCustomReactions }: { maxResults?: number; hideCustomReactions?: boolean } = {}
) {
  const reactionsData = useReactionsData()

  /**
   *
   * Implementation is based on `emoji-mart` search index
   *
   * @see https://github.com/missive/emoji-mart/blob/16978d04a766eec6455e2e8bb21cd8dc0b3c7436/packages/emoji-mart/src/helpers/search-index.ts#L23
   */
  const reactionSearchResults: (StandardReaction | SyncCustomReaction)[] = useMemo(() => {
    if (!query) return []

    const reactions = Object.values(reactionsData?.reactions ?? {}).filter((reaction) => {
      const skin = reaction.skins[0]

      if (!skin) return false
      if (hideCustomReactions) return isStandardReactionSkin(skin)
      return true
    })

    const normalizedQueries = query
      .toLowerCase()
      .replace(/(\w)-/, '$1 ')
      .split(/[\s|,]+/)
      .filter((word, i, words) => word.trim() && words.indexOf(word) == i)

    let pool = reactions
    let results: ReactionData[] = []
    let scores: Record<string, number> = {}

    for (const normalizedQuery of normalizedQueries) {
      if (!reactions.length) break

      results = []
      scores = {}

      for (const reaction of pool) {
        /**
         *
         * A reaction name can be recognized in many ways. In order to introduce
         * a sense of hierarchy, we give different weights to each property
         * in order of importance:
         *  - id: 1
         *  - name: 0.95
         *  - keywords: 0.75
         *  - emoticons: 0.5
         *
         * Note 1: `commandScore` can be a number between 0 and 1. To limit the number of
         * noisy results, we use 0.15 as the minimum score threshold.
         *
         * Note 2: To increase ranking for exact matches, we always lowercase the terms
         * that are being compared.
         *
         * Note 3: scores are sorted in ascending order, so we need to invert
         * the number to get the best results first.
         *
         */
        const fuzzyScore = Math.max(
          commandScore(reaction.id.toLowerCase(), normalizedQuery),
          commandScore(reaction.name.toLowerCase(), normalizedQuery) * 0.95,
          ...reaction.keywords.map((keyword) => commandScore(keyword.toLowerCase(), normalizedQuery) * 0.75),
          ...reaction.emoticons.map((emoticons) => commandScore(emoticons.toLowerCase(), normalizedQuery) * 0.5)
        )
        const score = fuzzyScore < 0.15 ? -1 : 1 - fuzzyScore

        if (score === -1) continue

        results.push(reaction)
        scores[reaction.id] || (scores[reaction.id] = 0)
        scores[reaction.id] += reaction.id == normalizedQuery ? 0 : score + 1
      }

      pool = results
    }

    if (results.length < 2) return results.map(formatReactionData)

    results.sort((a, b) => {
      const aScore = scores[a.id]
      const bScore = scores[b.id]

      if (aScore == bScore) return a.id.localeCompare(b.id)
      return aScore - bScore
    })

    return results.slice(0, maxResults).map(formatReactionData)
  }, [query, reactionsData?.reactions, maxResults, hideCustomReactions])

  return {
    reactionSearchResults
  }
}
