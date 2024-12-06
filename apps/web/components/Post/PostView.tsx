import { createContext, RefObject, useContext, useMemo, useRef, useState } from 'react'
import Router, { useRouter } from 'next/router'
import { isMobile } from 'react-device-detect'

import { Comment, Post, TimelineEvent, User } from '@campsite/types'
import {
  Button,
  CheckCircleIcon,
  LayeredHotkeys,
  PaperAirplaneIcon,
  PostIcon,
  RotateIcon,
  useBreakpoint
} from '@campsite/ui'
import { cn } from '@campsite/ui/src/utils'

import { CopyCurrentUrl } from '@/components/CopyCurrentUrl'
import { EmptyState } from '@/components/EmptyState'
import { FullPageLoading } from '@/components/FullPageLoading'
import { InboxSplitViewTitleBar } from '@/components/InboxItems/InboxSplitView'
import { InboxTriageActions } from '@/components/InboxItems/InboxTriageActions'
import { ConfirmDeleteResolutionDialog } from '@/components/InlinePost/ConfirmDeleteResolutionDialog'
import { CommentComposerResolutionBanner } from '@/components/InlinePost/Resolution'
import { ResolutionHovercard } from '@/components/InlinePost/ResolutionHovercard'
import { PostBreadcrumbs } from '@/components/Post/PostBreadcrumbs'
import { PostInlineIssues } from '@/components/Post/PostInlineIssues'
import { PostInlineReferences } from '@/components/Post/PostInlineReferences'
import { PostNavigationButtons } from '@/components/Post/PostNavigationButtons'
import { PostOverflowMenu } from '@/components/Post/PostOverflowMenu'
import { PostSharePopover } from '@/components/Post/PostSharePopover'
import { PostViewersFacepilePopover } from '@/components/Post/PostViewersFacepilePopover'
import { ResolveDialog } from '@/components/Post/ResolveDialog'
import { PostInlineSummary } from '@/components/Post/TLDR'
import { UnseenCommentsButton } from '@/components/Post/UnseenCommentsButton'
import { useCreateActivePostView } from '@/components/Post/useCreateActivePostView'
import { useUnseenCommentScrollSync } from '@/components/Post/useUnseenCommentsScrollSync'
import { SplitViewBreadcrumbs } from '@/components/SplitView'
import { useIsSplitViewAvailable } from '@/components/SplitView/hooks'
import { SubjectEspcapeLayeredHotkeys } from '@/components/Subject'
import { useScope } from '@/contexts/scope'
import { useGetCurrentUser } from '@/hooks/useGetCurrentUser'
import { useGetPost } from '@/hooks/useGetPost'
import { useGetPostComments } from '@/hooks/useGetPostComments'
import { useGetPostTimelineEvents } from '@/hooks/useGetPostTimelineEvents'
import { useMergeRefs } from '@/hooks/useMergeRefs'
import { flattenInfiniteData } from '@/utils/flattenInfiniteData'
import { signinUrl } from '@/utils/queryClient'
import { getImmediateScrollableNode, scrollImmediateScrollableNodeToBottom } from '@/utils/scroll'

import { CommentListHeader } from '../Comments/CommentListHeader'
import { CommentsList } from '../Comments/CommentsList'
import { PostCommentComposer } from '../Comments/PostCommentComposer'
import { FullPageError } from '../Error'
import { InlinePost } from '../InlinePost'
import { ReplyContent } from '../ReplyContent'
import { ScrollableContainer } from '../ScrollableContainer'
import { useTrackRecentlyViewedItem } from '../Sidebar/RecentlyViewed/utils'

const PostViewContext = createContext<string | null>(null)

export const usePostView = () => useContext(PostViewContext)

export function PostView(props: { postId?: string }) {
  const router = useRouter()
  const { scope } = useScope()
  const postId = props.postId || (router.query?.postId as string)

  const {
    data: post,
    isSuccess,
    isPending,
    isFetching,
    error
  } = useGetPost({ postId, refetchOnWindowFocus: true, fetchIfStale: true })
  const getComments = useGetPostComments({ postId, enabled: true })
  const getTimelineEvents = useGetPostTimelineEvents({
    postId,
    enabled: !!post?.viewer_is_organization_member
  })
  const timelineEvents = useMemo(() => flattenInfiniteData(getTimelineEvents.data) ?? [], [getTimelineEvents.data])
  const { data: currentUser } = useGetCurrentUser()

  if (isPending) {
    return <FullPageLoading />
  }

  if (error) {
    if (currentUser?.logged_in) {
      if (error.message === 'Record not found.') {
        return (
          <EmptyState
            icon={<PostIcon size={48} className='text-quaternary' />}
            title='Post not found'
            message='The post you are looking for does not exist or was deleted.'
          >
            <div className='mt-4'>
              <Button onClick={() => router.push(`/${scope}`)} variant='primary'>
                Go home
              </Button>
            </div>
          </EmptyState>
        )
      }
      return <FullPageError message={error.message} />
    } else {
      window.location.replace(signinUrl({ from: window.location.pathname }))
      return null
    }
  }

  if (isSuccess && !post) {
    return (
      <EmptyState
        icon={<PostIcon />}
        title='Post not found'
        message='The post you are looking for does not exist or has been deleted.'
      />
    )
  }

  if (!post) {
    return (
      <EmptyState
        icon={<PostIcon size={48} className='text-quaternary' />}
        title='Post not found'
        message='The post you are looking for does not exist or has been deleted.'
      >
        <div className='mt-4'>
          <Button onClick={() => Router.push(`/${scope}`)} variant='primary'>
            Go home
          </Button>
        </div>
      </EmptyState>
    )
  }

  return (
    <PostViewContext.Provider value={postId}>
      <SubjectEspcapeLayeredHotkeys />
      <CopyCurrentUrl override={post?.url} />

      <InnerPostView
        key={postId}
        post={post}
        isFetching={isFetching}
        getComments={getComments}
        timelineEvents={timelineEvents}
      />
    </PostViewContext.Provider>
  )
}

interface Props {
  post: Post
  isFetching: boolean
  getComments: ReturnType<typeof useGetPostComments>
  timelineEvents: TimelineEvent[]
}

function InnerPostView({ post, isFetching, getComments, timelineEvents }: Props) {
  useCreateActivePostView({ postId: post.id, isFetching })

  return (
    <div className='flex min-w-0 flex-1 flex-col overflow-hidden'>
      <PostViewTitlebar post={post} />
      <InnerPostViewContent post={post} getComments={getComments} timelineEvents={timelineEvents} />
    </div>
  )
}

function InnerPostViewContent({ post, getComments, timelineEvents }: Omit<Props, 'isFetching'>) {
  const { data: currentUser } = useGetCurrentUser()
  const trackRef = useTrackRecentlyViewedItem({ id: post.id, post })
  const endOfCommentsRef = useRef<HTMLDivElement>(null)
  const comments = useMemo(() => flattenInfiniteData(getComments.data) ?? [], [getComments.data])
  const { unseenComments, unseenCommentUsers, endInViewRef, endOfCommentsInView } = useUnseenCommentScrollSync({
    scrollContainer: getImmediateScrollableNode(endOfCommentsRef.current),
    comments
  })
  const setEndOfCommentsRefs = useMergeRefs(endOfCommentsRef, endInViewRef)
  const [replyingToCommentId, setReplyingToCommentId] = useState<string | null>(null)
  const replyingToComment = comments?.find((c) => c.id === replyingToCommentId)
  const [resolveDialogIsOpen, setResolveDialogIsOpen] = useState(false)
  const [confirmDeleteResolutionDialogIsOpen, setConfirmDeleteResolutionDialogIsOpen] = useState(false)

  return (
    <>
      <LayeredHotkeys
        keys='shift+r'
        options={{ enabled: post.viewer_can_resolve }}
        callback={() => {
          if (post.resolution) {
            setConfirmDeleteResolutionDialogIsOpen(true)
          } else {
            setResolveDialogIsOpen(true)
          }
        }}
      />

      {currentUser?.logged_in && (
        <>
          <ResolveDialog postId={post.id} open={resolveDialogIsOpen} onOpenChange={setResolveDialogIsOpen} />
          <ConfirmDeleteResolutionDialog
            postId={post.id}
            open={confirmDeleteResolutionDialogIsOpen}
            onOpenChange={setConfirmDeleteResolutionDialogIsOpen}
          />
        </>
      )}

      <div ref={trackRef} className='bg-secondary dark:bg-primary flex min-w-0 flex-1 flex-col overflow-hidden'>
        {/* Post & Comments */}
        <ScrollableContainer disableScrollRestoration className='relative flex-initial flex-col'>
          {/* Post */}
          <div className='bg-primary'>
            <div
              className={cn(
                'relative mx-auto flex w-full max-w-[--post-width] flex-col',
                'px-4 pb-4 pt-6 md:pt-8 lg:pt-10 xl:pt-12 2xl:pt-14'
              )}
            >
              <InlinePost
                post={post}
                display='page'
                // Only show project in byline on mobile when the sidebar is hidden by default and channel breadcrumbs don't exist
                hideProject={!isMobile}
              />

              {post.viewer_is_organization_member && (
                <div className='-ml-1 flex flex-col gap-4 py-4'>
                  <PostInlineIssues post={post} />
                  <PostInlineReferences timelineEvents={timelineEvents} />
                  <PostInlineSummary postId={post.id} source='post-view-inline-summary' />
                </div>
              )}
            </div>
          </div>

          {/* Comments */}
          <div className='bg-secondary dark:bg-primary border-t'>
            <div className='relative mx-auto flex w-full max-w-[--post-width] flex-col px-4'>
              <Comments
                postId={post.id}
                replyingToCommentId={replyingToCommentId}
                setReplyingToCommentId={setReplyingToCommentId}
                getComments={getComments}
                timelineEvents={timelineEvents}
                comments={comments}
              />
            </div>
          </div>

          <div ref={setEndOfCommentsRefs} className='h-px w-full shrink-0' />
        </ScrollableContainer>

        <ReplyComposer
          post={post}
          endOfCommentsRef={endOfCommentsRef}
          endOfCommentsInView={endOfCommentsInView}
          replyingToComment={replyingToComment}
          setReplyingToCommentId={setReplyingToCommentId}
          unseenComments={unseenComments}
          unseenCommentUsers={unseenCommentUsers}
        />
      </div>
    </>
  )
}

function PostViewTitlebar({ post }: { post: Post }) {
  const [sharePopoverOpen, setSharePopoverOpen] = useState(false)
  const { data: currentUser } = useGetCurrentUser()
  const { isSplitViewAvailable } = useIsSplitViewAvailable()
  const [resolveDialogIsOpen, setResolveDialogIsOpen] = useState(false)
  const [confirmDeleteResolutionDialogIsOpen, setConfirmDeleteResolutionDialogIsOpen] = useState(false)

  const handlePostResolution = () => {
    if (post.resolution) {
      setConfirmDeleteResolutionDialogIsOpen(true)
    } else {
      setResolveDialogIsOpen(true)
    }
  }

  if (!currentUser?.logged_in) return null

  return (
    <>
      <ResolveDialog postId={post.id} open={resolveDialogIsOpen} onOpenChange={setResolveDialogIsOpen} />
      <ConfirmDeleteResolutionDialog
        postId={post.id}
        open={confirmDeleteResolutionDialogIsOpen}
        onOpenChange={setConfirmDeleteResolutionDialogIsOpen}
      />
      <InboxSplitViewTitleBar hideSidebarToggle={isSplitViewAvailable}>
        {isSplitViewAvailable ? (
          <SplitViewBreadcrumbs />
        ) : (
          <>
            <PostNavigationButtons postId={post.id} />
            <InboxTriageActions />
            <PostBreadcrumbs post={post} />
          </>
        )}

        {post.viewer_is_organization_member && (
          <div className='flex items-center gap-1.5'>
            <PostViewersFacepilePopover post={post} />
            <PostSharePopover
              side='bottom'
              align='end'
              post={post}
              open={sharePopoverOpen}
              onOpenChange={setSharePopoverOpen}
              source='feed'
            >
              <Button leftSlot={<PaperAirplaneIcon />} variant='plain'>
                Share
              </Button>
            </PostSharePopover>
            <Button
              leftSlot={post.resolution ? <RotateIcon /> : <CheckCircleIcon />}
              variant='plain'
              onClick={handlePostResolution}
            >
              {post.resolution ? 'Reopen' : 'Resolve'}
            </Button>
            {post.viewer_is_organization_member && <PostOverflowMenu align='end' type='dropdown' post={post} />}
          </div>
        )}
      </InboxSplitViewTitleBar>
    </>
  )
}

export const PAGE_COMMENTS_ID = 'page-comments'

interface CommentsProps {
  postId: string
  replyingToCommentId: string | null
  setReplyingToCommentId: (id: string | null) => void
  getComments: ReturnType<typeof useGetPostComments>
  timelineEvents: TimelineEvent[]
  // this is flattened above so pass as a prop to avoid double-flattening
  comments: Comment[]
}

function Comments({
  postId,
  replyingToCommentId,
  setReplyingToCommentId,
  getComments,
  timelineEvents,
  comments
}: CommentsProps) {
  const { data: post } = useGetPost({ postId })
  const { isFetching, isFetchingNextPage, hasNextPage, fetchNextPage } = getComments

  if (!post) return null

  return (
    <div id={PAGE_COMMENTS_ID} className='relative flex w-full flex-1 flex-col gap-4 pt-4 transition-all'>
      <CommentListHeader post={post} />

      {hasNextPage && (
        <Button variant='flat' disabled={isFetching || isFetchingNextPage} onClick={() => fetchNextPage()}>
          Show previous comments
        </Button>
      )}

      <CommentsList
        post={post}
        comments={comments}
        timelineEvents={timelineEvents}
        replyingToCommentId={replyingToCommentId}
        setReplyingToCommentId={setReplyingToCommentId}
      />
    </div>
  )
}

interface ReplyComposerProps {
  post: Post
  endOfCommentsRef: RefObject<HTMLDivElement>
  endOfCommentsInView: boolean
  setReplyingToCommentId: (id: string | null) => void
  replyingToComment: Comment | undefined
  unseenComments: Comment[]
  unseenCommentUsers: User[]
}

function ReplyComposer({
  post,
  endOfCommentsRef,
  endOfCommentsInView,
  replyingToComment,
  setReplyingToCommentId,
  unseenComments,
  unseenCommentUsers
}: ReplyComposerProps) {
  const canReplyInline = useBreakpoint('md')
  const isReplyingInStickyEditor = !!replyingToComment && !canReplyInline

  return (
    <div>
      <div
        className={cn('h-px w-full shrink-0 border-t', {
          'border-transparent': endOfCommentsInView
        })}
      />
      <div className='pb-safe-offset-3 sticky bottom-0 mx-auto flex w-full max-w-[--post-width] flex-1 flex-col gap-3 p-4'>
        {isReplyingInStickyEditor && (
          <div className='w-full'>
            <ReplyContent
              attachments={replyingToComment.attachments}
              author={replyingToComment.member.user}
              content={replyingToComment.body_html}
              onCancel={() => setReplyingToCommentId(null)}
            />
          </div>
        )}

        <UnseenCommentsButton
          comments={unseenComments}
          users={unseenCommentUsers}
          onScrollToBottom={() => {
            scrollImmediateScrollableNodeToBottom(endOfCommentsRef.current)
          }}
        />

        <div className='flex flex-1 flex-col gap-3'>
          {post.resolution && (
            <ResolutionHovercard post={post} side='top' align='center'>
              <span className='-mb-6'>
                <CommentComposerResolutionBanner />
              </span>
            </ResolutionHovercard>
          )}

          <PostCommentComposer
            postId={post.id}
            maxHeight='40vh'
            onCreated={(comment) => {
              if (replyingToComment) {
                // on mobile, the new reply will usually be hidden offscreen, so scroll to it
                if (isMobile) {
                  Router.replace({ hash: `#comment-${comment.id}` }, undefined, {
                    shallow: true,
                    scroll: false
                  })
                }
                setReplyingToCommentId(null)
              } else {
                scrollImmediateScrollableNodeToBottom(endOfCommentsRef.current)
              }
            }}
            placeholder={isReplyingInStickyEditor ? 'Write a reply...' : 'Write a comment...'}
            replyingToCommentId={isReplyingInStickyEditor ? replyingToComment?.id : undefined}
          />
        </div>
      </div>
    </div>
  )
}
