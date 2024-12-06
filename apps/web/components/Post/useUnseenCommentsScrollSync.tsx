import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useInView } from 'react-intersection-observer'

import { Comment } from '@campsite/types'

import { useGetCurrentUser } from '@/hooks/useGetCurrentUser'
import { scrollImmediateScrollableNodeToBottom } from '@/utils/scroll'

interface UseCommentScrollSyncProps {
  scrollContainer: HTMLElement | null
  comments?: Comment[]
}

export function useUnseenCommentScrollSync({ scrollContainer, comments }: UseCommentScrollSyncProps) {
  const { data: currentUser } = useGetCurrentUser()
  // track the number of comments so that we don't show "new comments" when the page first mounts
  const commentsLength = useRef(comments?.length)
  const [unseenComments, setUnseenComments] = useState<Comment[]>([])
  const [endInViewRef, endOfCommentsInView] = useInView()

  const unseenCommentUsers = useMemo(() => {
    return (
      unseenComments
        .map((comment) => comment.member.user)
        // unique, in case one user comments multiple times
        .filter((user, index, self) => self.findIndex((u) => u.id === user.id) === index)
    )
  }, [unseenComments])

  const onNewComment = useCallback(
    (comment: Comment) => {
      if (!scrollContainer) return
      const mainScrollTop = scrollContainer.scrollTop
      const commentsScrollheight = scrollContainer.scrollHeight
      const viewportHeight = window.innerHeight
      const isAtBottom = mainScrollTop + viewportHeight >= commentsScrollheight - unseenCommentsWiggleRoom

      if (isAtBottom) {
        requestAnimationFrame(() => scrollImmediateScrollableNodeToBottom(scrollContainer))
      } else {
        setUnseenComments((prev) => [...prev, comment])
      }
    },
    [scrollContainer]
  )

  useEffect(() => {
    if (!comments) return

    if (!commentsLength.current) {
      commentsLength.current = comments.length
      return
    }

    if (comments.length <= commentsLength.current) return

    // don't toast for your own comments
    const lastComment = comments[0]
    const lastCommentIsAuthors = lastComment.member.user.id === currentUser?.id
    // user could leave a comment without being scrolled to the bottom, they shouldn't
    // see a toast for their own activity

    if (lastCommentIsAuthors) return

    // keep track of the number of comments
    commentsLength.current = comments.length

    // comments are sorted newest -> oldest, so [0] is the newest comment created
    onNewComment(comments[0])
  }, [currentUser?.id, comments, onNewComment])

  // if a user scrolls to the bottom of the view instead of clicking the "new comments" button,
  // the button should also be hidden
  useEffect(() => {
    if (endOfCommentsInView) setUnseenComments([])
  }, [endOfCommentsInView])

  // if a user is scrolled this far away (or less) from the bottom of the comments,
  // we can assume they're ~basically at the bottom of the comments and the view
  // should auto-scroll as new comments arrive
  const unseenCommentsWiggleRoom = 150

  return { unseenComments, unseenCommentUsers, endInViewRef, endOfCommentsInView }
}
