import { useCallback, useEffect, useMemo } from 'react'
import { useAtom, useSetAtom } from 'jotai'
import { atomFamily } from 'jotai/utils'

import { useScope } from '@/contexts/scope'
import { atomWithWebStorage } from '@/utils/atomWithWebStorage'
import { getFromStorage } from '@/utils/getFromStorage'
import { notEmpty } from '@/utils/notEmpty'
import { formatReactionData, isStandardReaction } from '@/utils/reactions'

import { useReactionsData } from './useReactionsData'

const didMigrateEmojiMartCacheAtom = atomWithWebStorage<boolean>('reactions:did-migrate-emoji-mart-cache', false)
const lastUsedReactionIdAtom = atomFamily((scope: string) =>
  atomWithWebStorage<string | null>(`reactions:last-used:${scope}`, null)
)
const frequentReactionIdsMapAtom = atomFamily((scope: string) =>
  atomWithWebStorage<Record<string, number> | null>(`reactions:frequent:${scope}`, null)
)

const MAX_FREQUENT_RESULTS = 27
const DEFAULT_FREQUENT_REACTIONS = ['+1', 'smile', 'slightly_frowning_face', 'rocket', '-1', 'heart', 'eyes']

export function useAddFrequentlyUsedReaction() {
  const { scope } = useScope()
  const setLastUsedReactionId = useSetAtom(lastUsedReactionIdAtom(`${scope}`))
  const [frequentReactionIdsMap, setFrequentReactionIdsMap] = useAtom(frequentReactionIdsMapAtom(`${scope}`))

  const addReactionIdToFrequents = useCallback(
    ({ id }: { id: string }) => {
      const newFrequentIds = frequentReactionIdsMap ? { ...frequentReactionIdsMap } : {}

      newFrequentIds[id] = newFrequentIds[id] ? newFrequentIds[id] + 1 : 1

      setLastUsedReactionId(id)
      setFrequentReactionIdsMap(newFrequentIds)
    },
    [frequentReactionIdsMap, setFrequentReactionIdsMap, setLastUsedReactionId]
  )

  return {
    addReactionIdToFrequents
  }
}

export function useFrequentlyUsedReactions({ hideCustomReactions }: { hideCustomReactions?: boolean } = {}) {
  const { scope } = useScope()
  const reactionsData = useReactionsData()
  const [didMigrateEmojiMartCache, setDidMigrateEmojiMartCache] = useAtom(didMigrateEmojiMartCacheAtom)
  const [lastUsedReactionId, setLastUsedReactionId] = useAtom(lastUsedReactionIdAtom(`${scope}`))
  const [frequentReactionIdsMap, setFrequentReactionIdsMap] = useAtom(frequentReactionIdsMapAtom(`${scope}`))

  // Temporary effect to migrate emoji-mart cache to the new frequent reactions cache
  useEffect(() => {
    if (didMigrateEmojiMartCache) return

    const emojiMartLastUsedCache = getFromStorage(localStorage, 'emoji-mart.last', null)
    const emojiMartFrequentCache = getFromStorage(localStorage, 'emoji-mart.frequently', null)

    if (emojiMartLastUsedCache) setLastUsedReactionId(emojiMartLastUsedCache)
    if (emojiMartFrequentCache) setFrequentReactionIdsMap(emojiMartFrequentCache)

    // localStorage.removeItem('emoji-mart.last')
    // localStorage.removeItem('emoji-mart.frequently')

    setDidMigrateEmojiMartCache(true)
  }, [didMigrateEmojiMartCache, setDidMigrateEmojiMartCache, setFrequentReactionIdsMap, setLastUsedReactionId])

  const frequentlyUsedReactions = useMemo(() => {
    const newFrequentIds = frequentReactionIdsMap ? { ...frequentReactionIdsMap } : {}

    const reactions = Object.keys(newFrequentIds)
      .sort((a, b) => {
        const aScore = newFrequentIds[b]
        const bScore = newFrequentIds[a]

        if (aScore === bScore) {
          return a.localeCompare(b)
        }

        return aScore - bScore
      })
      .map((id) => reactionsData?.reactions[id])
      .filter(notEmpty)
      .map(formatReactionData)
      .filter((reaction) => {
        if (hideCustomReactions) return isStandardReaction(reaction)
        return true
      })

    // if less than the default reactions, merge with default so the suggestion list is full
    if (reactions.length < DEFAULT_FREQUENT_REACTIONS.length) {
      const defaultReactionsNotInList = DEFAULT_FREQUENT_REACTIONS.filter(
        (defaultId) => !reactions.some((reaction) => reaction.id === defaultId)
      )

      const combinedReactions = [
        ...reactions,
        ...defaultReactionsNotInList
          .map((id) => reactionsData?.reactions[id])
          .filter(notEmpty)
          .map(formatReactionData)
      ]

      return combinedReactions
    }

    if (reactions.length <= MAX_FREQUENT_RESULTS) return reactions

    // remove old reactions from the cache
    reactions.slice(MAX_FREQUENT_RESULTS).forEach(({ id }) => {
      if (id === lastUsedReactionId) return
      delete newFrequentIds[id]
    })

    const trimmedReactions = reactions.slice(0, MAX_FREQUENT_RESULTS)
    const indexOfLastUsedReaction = trimmedReactions.findIndex(({ id }) => id === lastUsedReactionId)

    // insert last used reaction if it's not in the top MAX_FREQUENT_RESULTS
    if (lastUsedReactionId && indexOfLastUsedReaction) {
      const leastFrequentReaction = trimmedReactions[MAX_FREQUENT_RESULTS - 1]

      delete newFrequentIds[leastFrequentReaction.id]
      newFrequentIds[lastUsedReactionId] = 1
    }

    setFrequentReactionIdsMap(newFrequentIds)

    return trimmedReactions
  }, [
    frequentReactionIdsMap,
    hideCustomReactions,
    lastUsedReactionId,
    reactionsData?.reactions,
    setFrequentReactionIdsMap
  ])

  return {
    frequentlyUsedReactions
  }
}
