import { InfiniteData, useQueryClient } from '@tanstack/react-query'
import { CookieValueTypes } from 'cookies-next'
import { atom, useSetAtom } from 'jotai'
import { v4 as uuid } from 'uuid'

import {
  Attachment,
  Comment,
  CommentPage,
  CurrentUser,
  GroupedReaction,
  OrganizationMember,
  OrganizationPostComments2PostRequest,
  PostPage
} from '@campsite/types'

import { EMPTY_HTML } from '@/atoms/markdown'
import { isAudio, isGif, isImage, isLottie, isOrigami, isPrinciple, isStitch, isVideo } from '@/components/Post/utils'
import { useScope } from '@/contexts/scope'
import { useQueryNormalizer } from '@/utils/normy/QueryNormalizerProvider'
import { apiClient, getTypedQueryData, setTypedInfiniteQueriesData, setTypedQueriesData } from '@/utils/queryClient'
import { getNormalizedData, setNormalizedData } from '@/utils/queryNormalization'
import { createRetryAtoms } from '@/utils/retryAtoms'
import { stripHtml } from '@/utils/stripHtml'
import { TransformedFile } from '@/utils/types'

import { bumpPostToTop } from './useCreatePost'

export interface CreateCommentData extends OrganizationPostComments2PostRequest {
  transformedFiles: TransformedFile[]
}

export interface CreateReplyData extends CreateCommentData {
  parentCommentId: string
}

export const serverIdToOptimisticIdMessagesAtom = atom<Map<string, string>>(new Map())
const setServerIdToOptimisticIdMessagesAtom = atom(null, (_get, set, { serverId, optimisticId }) => {
  set(serverIdToOptimisticIdMessagesAtom, (prev) => new Map(prev).set(serverId, optimisticId))
})

export const {
  createAtom: createCommentStateAtom,
  setStateAtom: setCommentStateAtom,
  updateStateAtom: updateCommentStateAtom,
  removeStateAtom: removeCommentStateAtom
} = createRetryAtoms<CreateCommentData | CreateReplyData>()

const getPostComments = apiClient.organizations.getPostsComments()
const getPostCanvasComments = apiClient.organizations.getPostsCanvasComments()
const getPostAttachmentComments = apiClient.organizations.getPostsAttachmentsComments()
const getNoteComments = apiClient.organizations.getNotesComments()
const getNoteAttachmentComments = apiClient.organizations.getNotesAttachmentsComments()
const getProjectsPosts = apiClient.organizations.getProjectsPosts()

const updatePageQueryData = (newComment: Comment) => (old: InfiniteData<CommentPage> | undefined) => {
  if (!old) {
    // if there was no page, insert a new one so comment lists update immediately
    return {
      pageParams: [],
      pages: [
        {
          data: [newComment],
          total_count: 1
        }
      ]
    }
  } else {
    // insert the new comment at the top of the first page
    const [firstPage, ...rest] = old.pages

    return {
      ...old,
      pages: [
        {
          ...firstPage,
          data: [newComment, ...firstPage.data]
        },
        ...rest
      ]
    }
  }
}

function replaceOptimisticComments(optimisticId: string, comments: Comment[], serverComment: Comment): Comment[] {
  return comments.map((comment) => {
    // replace with server comment on match
    if (comment.id === optimisticId) {
      return {
        ...serverComment,
        optimistic_id: optimisticId
      }
    }
    return comment
  })
}

const replaceOptimisticPageQueryData =
  (optimisticId: string, newComment: Comment) => (old: InfiniteData<CommentPage> | undefined) => {
    if (!old) return
    return {
      ...old,
      pages: old.pages.map((page) => ({
        ...page,
        data: replaceOptimisticComments(optimisticId, page.data, newComment)
      }))
    }
  }

type CommentableSubjectType = 'post' | 'note'

interface OptimisticUpdateProps {
  scope: CookieValueTypes
  queryClient: ReturnType<typeof useQueryClient>
  queryNormalizer: ReturnType<typeof useQueryNormalizer>
  subjectId: string
  subjectType: CommentableSubjectType
  data: CreateCommentData
  parentCommentId?: string
  optimisticId: string
  currentUser: CurrentUser
}

async function optimisticUpdate({
  scope,
  queryClient,
  queryNormalizer,
  subjectId,
  subjectType,
  data,
  parentCommentId,
  optimisticId,
  currentUser
}: OptimisticUpdateProps) {
  const attachmentId = data.file_id ?? null
  const getPostCommentsKey = getPostComments.requestKey({ orgSlug: `${scope}`, postId: subjectId })
  const getNoteCommentsKey = getNoteComments.requestKey({ orgSlug: `${scope}`, noteId: subjectId })
  const getPostAttachmentCommentsKey =
    attachmentId &&
    getPostAttachmentComments.requestKey({
      orgSlug: `${scope}`,
      postId: subjectId,
      attachmentId
    })
  const getNoteAttachmentCommentsKey =
    attachmentId &&
    getNoteAttachmentComments.requestKey({
      orgSlug: `${scope}`,
      noteId: subjectId,
      attachmentId
    })

  await Promise.all([
    queryClient.cancelQueries({ queryKey: getPostCommentsKey }),
    queryClient.cancelQueries({ queryKey: getNoteCommentsKey }),
    getPostAttachmentCommentsKey && queryClient.cancelQueries({ queryKey: getPostAttachmentCommentsKey }),
    getNoteAttachmentCommentsKey && queryClient.cancelQueries({ queryKey: getNoteAttachmentCommentsKey })
  ])

  currentUser = currentUser || getTypedQueryData(queryClient, apiClient.users.getMe().requestKey())

  const files: Attachment[] = data.transformedFiles.map((file) => {
    return {
      file_type: file.type,
      key: file.key ?? '',
      relative_url: file.key ?? '',
      preview_relative_url: '',
      url: file.url,
      image: isImage(file.type),
      video: isVideo(file.type),
      gif: isGif(file.type),
      origami: isOrigami(file.type),
      principle: isPrinciple(file.type),
      stitch: isStitch(file.type),
      lottie: isLottie(file.type),
      audio: isAudio(file.type),
      no_video_track: false,
      id: file.id,
      app_url: '',
      download_url: '',
      duration: 0,
      subject_type: 'Comment',
      is_subject_comment: true,
      subject_id: optimisticId,
      width: file.width ?? 0,
      height: file.height ?? 0,
      optimistic_src: file.optimistic_src,
      link: false,
      preview_url: null,
      preview_thumbnail_url: null,
      image_urls: null,
      remote_figma_url: null,
      optimistic_ready: false,
      name: null,
      size: null,
      comments_count: 0,
      type_name: 'attachment',
      gallery_id: null
    }
  })

  const newComment: Comment = {
    id: optimisticId,
    body_html: data.body_html ?? EMPTY_HTML,
    created_at: new Date().toISOString(),
    url: '',
    is_optimistic: true,
    member: {
      id: `temp-${Math.random()}`,
      role: 'member',
      created_at: new Date().toISOString(),
      deactivated: false,
      user: { ...currentUser, type_name: 'user' },
      is_organization_member: true,
      status: null
    },
    grouped_reactions: [] as GroupedReaction[],
    replies: [],
    attachments: files,
    follow_ups: [],
    timeline_events: [],
    parent_id: parentCommentId ?? null,
    attachment_id: attachmentId,
    timestamp: data.timestamp ? data.timestamp : null,
    viewer_is_author: true,
    x: data.x ?? null,
    y: data.y ?? null,
    resolved_at: null,
    resolved_by: null,
    viewer_can_resolve: !parentCommentId,
    viewer_can_create_issue: true,
    viewer_can_edit: true,
    viewer_can_delete: true,
    viewer_can_follow_up: true,
    viewer_can_react: true,
    optimistic_id: optimisticId,
    note_highlight: data.note_highlight ?? null,
    type_name: 'comment',
    canvas_preview_url: null,
    attachment_thumbnail_url: null,
    subject_type: subjectType,
    subject_id: subjectId,
    resource_mentions: []
  }

  // if this is a reply, add it to the parent comment in the normalized cache
  if (parentCommentId) {
    setNormalizedData({
      queryNormalizer,
      type: 'comment',
      id: parentCommentId,
      update: (old) => ({
        replies: [...old.replies, newComment]
      })
    })
  } else {
    setTypedInfiniteQueriesData(queryClient, getPostCommentsKey, updatePageQueryData(newComment))
    setTypedInfiniteQueriesData(queryClient, getNoteCommentsKey, updatePageQueryData(newComment))

    if (getPostAttachmentCommentsKey) {
      setTypedInfiniteQueriesData(queryClient, getPostAttachmentCommentsKey, updatePageQueryData(newComment))
    }

    if (getNoteAttachmentCommentsKey) {
      setTypedInfiniteQueriesData(queryClient, getNoteAttachmentCommentsKey, updatePageQueryData(newComment))
    }

    setTypedQueriesData(queryClient, getPostCanvasComments.requestKey(`${scope}`, subjectId), (old) => {
      if (!old) {
        // empty cache, insert the new comment
        return [newComment]
      } else {
        // append the new comment to the end of the list
        return [...old, newComment]
      }
    })
  }

  if (attachmentId) {
    setNormalizedData({
      queryNormalizer,
      type: 'attachment',
      id: attachmentId,
      update: (old) => ({ comments_count: (old.comments_count || 0) + 1 })
    })
  }

  // increment comments_count and mark any feedback requests from the viewer as replied
  if (subjectType === 'post') {
    setNormalizedData({
      queryNormalizer,
      type: 'post',
      id: subjectId,
      update: (old) => ({
        preview_commenters: {
          ...old.preview_commenters,
          latest_commenters: [newComment.member, ...old.preview_commenters.latest_commenters].filter(
            (member, index, self) => self.findIndex((m) => m.user.id === member.user.id) === index
          )
        },
        comments_count: old.comments_count + 1,
        viewer_is_commenter: true,
        comments_are_blurred: false,
        viewer_has_commented: true,
        viewer_has_subscribed: true,
        viewer_feedback_status: old.viewer_feedback_status === 'viewer_requested' ? 'none' : old.viewer_feedback_status,
        feedback_requests:
          old.feedback_requests?.map((request) => {
            if (request.member.user.id !== currentUser?.id) return request
            return {
              ...request,
              has_replied: true
            }
          }) ?? null,
        latest_comment_preview: `${newComment.member.user.display_name}: ${stripHtml(newComment.body_html)}`
      })
    })
  } else if (subjectType === 'note') {
    setNormalizedData({
      queryNormalizer,
      type: 'note',
      id: subjectId,
      update: (old) => ({
        comments_count: old.comments_count + 1,
        latest_commenters: [newComment.member, ...old.latest_commenters].filter(
          (member, index, self) => self.findIndex((m) => m.user.id === member.user.id) === index
        )
      })
    })
  }

  return newComment
}

interface Props {
  subjectId: string
  subjectType: CommentableSubjectType
  optimisticId?: string
  onOptimisticCreate?: () => void
  onServerCreate?: (comment: Comment) => void
}

export interface CommentCreateMutateProps extends CreateCommentData {
  parentCommentId?: string
}

interface CommentCreateSuccessProps {
  optimisticId: string
  transformedFiles: TransformedFile[]
  newComment: Comment
  latestCommenters?: OrganizationMember[]
  attachment?: Attachment | null
  attachmentCommenters?: OrganizationMember[] | null
}

export function useCreateCommentCallbacks({ subjectId, subjectType, onOptimisticCreate, onServerCreate }: Props) {
  const { scope } = useScope()
  const queryClient = useQueryClient()
  const queryNormalizer = useQueryNormalizer()
  const setMutation = useSetAtom(setCommentStateAtom)
  const updateMutation = useSetAtom(updateCommentStateAtom)
  const removeMutation = useSetAtom(removeCommentStateAtom)
  const setServerIdToOptimisticId = useSetAtom(setServerIdToOptimisticIdMessagesAtom)

  const onMutate = async (data: CommentCreateMutateProps) => {
    const currentUser = getTypedQueryData(queryClient, apiClient.users.getMe().requestKey())
    const optimisticId = `optimistic_${uuid()}`

    if (currentUser) {
      await optimisticUpdate({
        scope,
        queryClient,
        queryNormalizer,
        subjectId,
        subjectType,
        data,
        currentUser,
        optimisticId,
        parentCommentId: data.parentCommentId
      })
      onOptimisticCreate?.()
    }

    setMutation({ optimisticId, state: { status: 'pending', data } })

    return { optimisticId }
  }

  const onSuccess = ({
    optimisticId,
    transformedFiles,
    newComment,
    latestCommenters,
    attachmentCommenters
  }: CommentCreateSuccessProps) => {
    removeMutation({ optimisticId })
    setServerIdToOptimisticId({ serverId: newComment.id, optimisticId })
    onServerCreate?.(newComment)

    // update the post with preview commenters from the server
    if (subjectType === 'post') {
      setNormalizedData({
        queryNormalizer,
        type: 'post',
        id: subjectId,
        update: { latest_commenters: latestCommenters ?? [] }
      })

      const post = getNormalizedData({ queryNormalizer, type: 'post', id: subjectId })

      if (post?.project) {
        setTypedInfiniteQueriesData(
          queryClient,
          getProjectsPosts.requestKey({
            orgSlug: post.organization.slug,
            projectId: post.project.id,
            order: { by: 'last_activity_at', direction: 'desc' }
          }),
          bumpPostToTop<PostPage>(post)
        )
      }
    } else {
      setNormalizedData({
        queryNormalizer,
        type: 'note',
        id: subjectId,
        update: { latest_commenters: latestCommenters ?? [], last_activity_at: new Date().toISOString() }
      })
    }

    if (newComment.attachment_id && attachmentCommenters) {
      setTypedQueriesData(
        queryClient,
        apiClient.organizations.getAttachmentsCommenters().requestKey(`${scope}`, newComment.attachment_id),
        attachmentCommenters
      )
    }

    const getPostCommentsKey = getPostComments.requestKey({ orgSlug: `${scope}`, postId: subjectId })
    const getNoteCommentsKey = getNoteComments.requestKey({ orgSlug: `${scope}`, noteId: subjectId })

    // replace the comment in the list cache. this is necessary to replace the temp ID with the server ID
    setTypedInfiniteQueriesData(
      queryClient,
      getPostCommentsKey,
      replaceOptimisticPageQueryData(optimisticId, newComment)
    )
    setTypedInfiniteQueriesData(
      queryClient,
      getNoteCommentsKey,
      replaceOptimisticPageQueryData(optimisticId, newComment)
    )

    if (newComment.attachment_id) {
      const getPostAttachmentCommentsKey = getPostAttachmentComments.requestKey({
        orgSlug: `${scope}`,
        postId: subjectId,
        attachmentId: newComment.attachment_id
      })
      const getNoteAttachmentCommentsKey = getNoteAttachmentComments.requestKey({
        orgSlug: `${scope}`,
        noteId: subjectId,
        attachmentId: newComment.attachment_id
      })

      setTypedInfiniteQueriesData(
        queryClient,
        getPostAttachmentCommentsKey,
        replaceOptimisticPageQueryData(optimisticId, newComment)
      )
      setTypedInfiniteQueriesData(
        queryClient,
        getNoteAttachmentCommentsKey,
        replaceOptimisticPageQueryData(optimisticId, newComment)
      )
    }

    // same thing as the comment list cache, but for the canvas comments
    setTypedQueriesData(queryClient, getPostCanvasComments.requestKey(`${scope}`, subjectId), (old) => {
      if (!old) return
      return replaceOptimisticComments(optimisticId, old, newComment)
    })

    // same thing as the comment list cache, but for the replies in the parent comment
    if (newComment.parent_id) {
      setNormalizedData({
        queryNormalizer,
        type: 'comment',
        id: newComment.parent_id,
        update: (old) => ({
          replies: replaceOptimisticComments(optimisticId, old.replies, newComment)
        })
      })
    }

    // insert a merged model into the normalized cache to avoid flickering images
    setNormalizedData({
      queryNormalizer,
      type: 'comment',
      id: optimisticId,
      update: (old) => {
        if (!old.is_optimistic) return {}

        /*
          Here we iterate over files from the persisted comment from the server and replace the URL
          with the URL from the blob file. This is because the server returns a URL
          that'll cause the browser to refetch the image thus causing a flicker.
        */
        let newAttachments = newComment.attachments.map((file) => {
          const optimisticFile = transformedFiles.find((transformedFile) =>
            file.url.includes(transformedFile.key as string)
          )

          if (!optimisticFile) return file

          return {
            ...file,
            optimistic_src: optimisticFile.optimistic_src
          }
        })

        /*
          This is important: we don't want to swap out the full optimistic
          comment because we use the optimistic comment's `created_at` field
          as a key for the framer motion divs, so that things animate in
          and out smoothly. You need a persistent key, otherwise Framer will
          stutter; for that reason, we use the `created_at` field from the optimistic
          comment as a stable key.

          Here, we just want to make sure that the cache has the correct id
          in case the user edits or deletes their comment right away.
        */
        return {
          ...newComment,
          attachments: newAttachments,
          created_at: old.created_at
        }
      }
    })
  }

  const onError = (optimisticId: string | null | undefined) => {
    if (optimisticId) {
      updateMutation({ optimisticId, status: 'error' })
    }
  }

  return { scope, onMutate, onSuccess, onError }
}
