import { AnimatePresence, m } from 'framer-motion'
import pluralize from 'pluralize'

import { Comment } from '@campsite/types'
import { UIText } from '@campsite/ui'

import { FacePile } from '@/components/FacePile'

export function UnseenCommentsButton({
  comments,
  users,
  onScrollToBottom
}: {
  comments: Comment[]
  users: Comment['member']['user'][]
  onScrollToBottom: () => void
}) {
  return (
    <AnimatePresence>
      {comments.length > 0 && (
        <m.button
          transition={{
            duration: 0.2
          }}
          initial={{
            opacity: 0,
            y: -48,
            left: '50%',
            translateX: '-50%'
          }}
          animate={{
            opacity: 1,
            y: -56
          }}
          exit={{
            opacity: 0,
            y: -48
          }}
          onClick={onScrollToBottom}
          className='absolute z-10 flex transform-gpu items-center gap-2 rounded-full bg-blue-500 py-2 pl-2 pr-3.5 text-white shadow-lg hover:scale-[1.02]'
        >
          <FacePile users={users} size='xs' limit={3} />
          <UIText weight='font-semibold' inherit>
            {comments.length} new {pluralize('comment', comments.length)}
          </UIText>
        </m.button>
      )}
    </AnimatePresence>
  )
}
