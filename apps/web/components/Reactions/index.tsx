import { AnimatePresence, motion, MotionConfig } from 'framer-motion'
import Image from 'next/image'

import { GroupedReaction, SyncCustomReaction } from '@campsite/types'
import { ANIMATIONS, Tooltip } from '@campsite/ui'

import { useEmojiMartData } from '@/hooks/reactions/useEmojiMartData'
import { findEmojiMartEmoji, formatReactionName, StandardReaction } from '@/utils/reactions'

interface Props {
  reactions: GroupedReaction[]
  onReactionSelect: (reaction: StandardReaction | SyncCustomReaction) => void
  getClasses: (hasReacted: boolean) => string
}

export function Reactions({ reactions, onReactionSelect, getClasses }: Props) {
  const { data: emojiMartData } = useEmojiMartData()

  if (!reactions || reactions.length === 0) return null

  return (
    <>
      <MotionConfig transition={{ duration: 0.2 }}>
        <AnimatePresence initial={false}>
          <>
            {reactions.map((reaction) => {
              if (reaction.reactions_count === 0) return null
              const reactionLabel = (() => {
                if (reaction.emoji) {
                  if (!emojiMartData) return null
                  return findEmojiMartEmoji(emojiMartData, reaction.emoji)?.name
                } else if (reaction.custom_content) {
                  return reaction.custom_content.name
                }

                return null
              })()

              return (
                <span key={reaction.emoji ?? reaction.custom_content?.id}>
                  <Tooltip
                    key={reaction.emoji}
                    label={
                      <p className='max-w-[200px]'>
                        {reaction.tooltip}
                        {reactionLabel && (
                          <>
                            {' '}
                            <span className='text-tertiary'>reacted with {formatReactionName(reactionLabel)}</span>
                          </>
                        )}
                      </p>
                    }
                  >
                    <motion.button
                      {...ANIMATIONS}
                      onClick={() => {
                        if (reaction.emoji && emojiMartData) {
                          const emojiMartEmoji = findEmojiMartEmoji(emojiMartData, reaction.emoji)

                          if (!emojiMartEmoji) return

                          onReactionSelect({
                            id: emojiMartEmoji.id,
                            native: reaction.emoji,
                            name: emojiMartEmoji.name
                          })
                        } else if (reaction.custom_content) {
                          onReactionSelect(reaction.custom_content)
                        }
                      }}
                      className={getClasses(!!reaction.viewer_reaction_id)}
                    >
                      {reaction.emoji && (
                        <span className='mt-0.5 font-["emoji"] text-sm leading-none'>{reaction.emoji}</span>
                      )}
                      {reaction.custom_content && (
                        <Image
                          className='mb-px h-[15px] w-[15px] object-contain'
                          src={reaction.custom_content.file_url}
                          alt={reaction.custom_content.name}
                          width={16}
                          height={16}
                        />
                      )}

                      {reaction.reactions_count > 0 && (
                        <span className='font-mono leading-none'>{reaction.reactions_count}</span>
                      )}
                    </motion.button>
                  </Tooltip>
                </span>
              )
            })}
          </>
        </AnimatePresence>
      </MotionConfig>
    </>
  )
}
