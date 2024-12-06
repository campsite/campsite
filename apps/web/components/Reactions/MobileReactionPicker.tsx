import { useLayoutEffect, useRef, useState } from 'react'
import Image from 'next/image'

import { SyncCustomReaction } from '@campsite/types'
import { cn, TextField } from '@campsite/ui'

import { useEmojiMartData } from '@/hooks/reactions/useEmojiMartData'
import { useAddFrequentlyUsedReaction, useFrequentlyUsedReactions } from '@/hooks/reactions/useFrequentlyUsedReactions'
import { useSearchReactions } from '@/hooks/reactions/useSearchReactions'
import { useSyncedCustomReactions } from '@/hooks/useSyncedCustomReactions'
import { notEmpty } from '@/utils/notEmpty'
import { isStandardReaction, StandardReaction } from '@/utils/reactions'
import { ALL_REACTION_CATEGORIES, getReactionCategoryLabel } from '@/utils/reactions/data'

interface MobileReactionPickerProps {
  showCustomReactions?: boolean
  onReactionSelect: (reaction: StandardReaction | SyncCustomReaction) => void
}

export function MobileReactionPicker({ showCustomReactions, onReactionSelect }: MobileReactionPickerProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const [query, setQuery] = useState('')
  const { data } = useEmojiMartData()
  const { addReactionIdToFrequents } = useAddFrequentlyUsedReaction()
  const { customReactions } = useSyncedCustomReactions()
  const { frequentlyUsedReactions } = useFrequentlyUsedReactions({ hideCustomReactions: !showCustomReactions })
  const { reactionSearchResults } = useSearchReactions(query, {
    maxResults: 90,
    hideCustomReactions: !showCustomReactions
  })

  const handleReactionSelect = (emoji: Parameters<MobileReactionPickerProps['onReactionSelect']>[number]) => {
    addReactionIdToFrequents({ id: emoji.id })
    onReactionSelect(emoji)
  }

  useLayoutEffect(() => {
    if (!scrollAreaRef.current) return

    scrollAreaRef.current.scrollTo({ left: 0, top: 0 })
  }, [query])

  return (
    <div className='relative flex w-full flex-col focus:outline-none'>
      <div className='mx-auto mt-2 h-1 w-8 rounded-full bg-[--text-primary] opacity-20' />

      <div className='px-safe-offset-3 pt-3'>
        <TextField
          value={query}
          onChange={setQuery}
          placeholder='Search'
          additionalClasses='bg-quaternary h-10 focus:bg-primary border-transparent rounded-lg px-3 text-base'
        />
      </div>
      <div
        ref={scrollAreaRef}
        className='scrollbar-hide pb-safe-offset-2 flex flex-row overflow-y-hidden overflow-x-scroll'
      >
        {query ? (
          <MobileReactionPickerCategory
            id={query ? 'search' : 'frequent'}
            reactions={query ? reactionSearchResults : frequentlyUsedReactions}
            onReactionSelect={handleReactionSelect}
          />
        ) : (
          ALL_REACTION_CATEGORIES.map((categoryName) => {
            const reactions = (() => {
              if (!showCustomReactions && categoryName === 'custom') return
              if (categoryName === 'custom') return customReactions
              if (categoryName === 'frequent') return frequentlyUsedReactions

              return data?.categories
                .find((category) => category.id === categoryName)
                ?.emojis.map((emojiId) => {
                  const emoji = data?.emojis[emojiId]

                  if (!emoji) return undefined

                  return {
                    id: emoji.id,
                    name: emoji.name,
                    native: emoji.skins[0]?.native,
                    // @ts-expect-error
                    file_url: emoji.skins[0]?.src
                  }
                })
                .filter(notEmpty)
            })()

            if (!reactions || !reactions.length) return null

            return (
              <MobileReactionPickerCategory
                key={categoryName}
                id={categoryName}
                reactions={reactions}
                onReactionSelect={handleReactionSelect}
              />
            )
          })
        )}
      </div>
    </div>
  )
}

interface MobileReactionPickerCategoryProps {
  id: string
  reactions: (StandardReaction | SyncCustomReaction)[]
  onReactionSelect: MobileReactionPickerProps['onReactionSelect']
}

function MobileReactionPickerCategory({ id, reactions, onReactionSelect }: MobileReactionPickerCategoryProps) {
  return (
    <div
      className={cn(
        'h-[240px]',
        '[&:first-child>div]:pl-safe-offset-3 [&:last-child>div]:pr-safe-offset-3',
        '[&:first-child>h2]:pl-safe-offset-5 [&:last-child>h2]:pr-safe-offset-3'
      )}
    >
      <h2 className='sticky left-0 w-fit whitespace-nowrap px-5 py-2 text-base font-medium'>
        {getReactionCategoryLabel(id)}
      </h2>
      <div
        data-vaul-no-drag
        className='grid w-full grid-flow-col grid-rows-5 place-content-start items-center gap-x-1 pl-3'
      >
        {reactions.map((reaction) => (
          <button
            data-vaul-no-drag
            key={reaction.id}
            onClick={() => onReactionSelect(reaction)}
            className='flex aspect-square h-10 w-10 shrink-0 items-center justify-center font-[emoji] text-3xl leading-none'
          >
            {isStandardReaction(reaction) ? (
              <span>{reaction.native}</span>
            ) : (
              <Image
                data-vaul-no-drag
                className='h-7.5 w-7.5 object-contain'
                src={reaction.file_url ?? ''}
                alt={reaction.name}
                width={30}
                height={30}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
