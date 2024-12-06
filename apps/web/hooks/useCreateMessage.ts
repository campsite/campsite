import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSetAtom } from 'jotai'
import { v4 as uuid } from 'uuid'

import {
  Attachment,
  Message,
  OrganizationsOrgSlugThreadsThreadIdMessagesPostRequest,
  PusherInvalidateMessage
} from '@campsite/types'

import { EMPTY_HTML } from '@/atoms/markdown'
import { usePusherSocketIdHeader } from '@/contexts/pusher'
import { useScope } from '@/contexts/scope'
import { apiErrorToast } from '@/utils/apiErrorToast'
import { useQueryNormalizer } from '@/utils/normy/QueryNormalizerProvider'
import { apiClient, setTypedInfiniteQueriesData, setTypedQueriesData } from '@/utils/queryClient'
import { createNormalizedOptimisticUpdate, setNormalizedData } from '@/utils/queryNormalization'
import { createRetryAtoms } from '@/utils/retryAtoms'
import { stripHtml } from '@/utils/stripHtml'

import { useGetCurrentUser } from './useGetCurrentUser'
import { useGetOrganizationMember } from './useGetOrganizationMember'
import { setServerIdToOptimisticIdAtom } from './useUploadChatAttachments'

type Props = Omit<OrganizationsOrgSlugThreadsThreadIdMessagesPostRequest, 'attachments'> & {
  threadId: string
  attachments?: Attachment[]
}

const {
  createAtom: createMessageStateAtom,
  setStateAtom: setCreateMessageStateAtom,
  updateStateAtom: updateCreateMessageStateAtom,
  removeStateAtom: removeCreateMessageStateAtom
} = createRetryAtoms<Props>()

export { createMessageStateAtom }

const postThreadsMessages = apiClient.organizations.postThreadsMessages()
const getThreads = apiClient.organizations.getThreads()
const getThreadsById = apiClient.organizations.getThreadsById()
const getMessages = apiClient.organizations.getThreadsMessages()

function transformAttachments(
  attachments?: Attachment[]
): OrganizationsOrgSlugThreadsThreadIdMessagesPostRequest['attachments'] {
  return (
    attachments?.map((a) => ({
      file_path: a.optimistic_file_path ?? '',
      preview_file_path: a.optimistic_preview_file_path ?? '',
      file_type: a.file_type,
      duration: a.duration,
      height: a.height,
      name: a.name,
      size: a.size,
      width: a.width,
      no_video_track: a.no_video_track
    })) ?? []
  )
}

function useCreateMessageCallbacks() {
  const { scope } = useScope()
  const queryClient = useQueryClient()
  const queryNormalizer = useQueryNormalizer()
  const setServerIdToOptimisticId = useSetAtom(setServerIdToOptimisticIdAtom)
  const updateMutation = useSetAtom(updateCreateMessageStateAtom)
  const removeMutation = useSetAtom(removeCreateMessageStateAtom)

  return {
    onSuccess: (data: PusherInvalidateMessage, { threadId, attachments }: Props, optimisticId: string) => {
      removeMutation({ optimisticId })

      const inputAttachments = attachments

      if (inputAttachments) {
        // ASSUMPTION: the length and order of attachments is the same between the server and client
        data.message.attachments.forEach((attachment, i) => {
          setServerIdToOptimisticId({
            optimisticId: inputAttachments[i].optimistic_id,
            serverId: attachment.id
          })
        })
      }

      setTypedQueriesData(queryClient, getThreads.requestKey(`${scope}`), (old) => {
        if (!old) return old
        const existingThread = old.threads.find((thread) => thread.id === threadId)

        // optimistically place the thread at the top of the list
        if (existingThread) {
          // remove the existing thread from the list
          const filtered = old.threads.filter((thread) => thread.id !== threadId)

          // add the new one to the top
          return {
            ...old,
            threads: [existingThread, ...filtered]
          }
        }
      })

      setTypedInfiniteQueriesData(queryClient, getMessages.requestKey({ orgSlug: `${scope}`, threadId }), (old) => {
        if (!old) return
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            data: page.data.map((message) => {
              if (message.optimistic_id === optimisticId) {
                return data.message
              }
              return message
            })
          }))
        }
      })

      setNormalizedData({
        queryNormalizer,
        type: 'thread',
        id: threadId,
        update: data.message_thread
      })
    },
    onError: (error: Error, optimisticId: string | undefined | null) => {
      if (optimisticId) {
        updateMutation({ optimisticId, status: 'error' })
      }
      apiErrorToast(error)
    }
  }
}

export function useCreateMessage() {
  const { scope } = useScope()
  const { data: currentUser } = useGetCurrentUser()
  const { data: membership } = useGetOrganizationMember({
    username: currentUser?.username ?? '',
    org: `${scope}`,
    enabled: !!currentUser
  })
  const queryClient = useQueryClient()
  const queryNormalizer = useQueryNormalizer()
  const pusherSocketIdHeader = usePusherSocketIdHeader()
  const setMutation = useSetAtom(setCreateMessageStateAtom)
  const { onSuccess, onError } = useCreateMessageCallbacks()

  return useMutation({
    scope: { id: 'create-message' },
    mutationFn: ({ threadId, attachments, ...data }: Props) =>
      postThreadsMessages.request(
        `${scope}`,
        threadId,
        { attachments: transformAttachments(attachments), ...data },
        { headers: pusherSocketIdHeader }
      ),
    onMutate: async (props) => {
      const optimisticId = uuid()

      setMutation({ optimisticId, state: { status: 'pending', data: props } })

      const messagesQueryKey = getMessages.requestKey({ orgSlug: `${scope}`, threadId: props.threadId })
      const threadsQueryKey = getThreads.requestKey(`${scope}`)
      const threadQueryKey = getThreadsById.requestKey(`${scope}`, props.threadId)

      await Promise.all([
        queryClient.cancelQueries({ queryKey: messagesQueryKey }),
        queryClient.cancelQueries({ queryKey: threadsQueryKey }),
        queryClient.cancelQueries({ queryKey: threadQueryKey })
      ])

      setTypedInfiniteQueriesData(queryClient, messagesQueryKey, (old) => {
        if (!membership || !old?.pages.length) return old

        let reply: Message['reply'] = null

        if (props.reply_to) {
          old.pages.forEach((page) => {
            if (!reply) {
              const match = page.data.find((message) => message.id === props.reply_to)

              if (match) {
                reply = {
                  ...match,
                  last_attachment: match.attachments.at(-1) || null,
                  sender_display_name: match.sender.user.display_name
                }
              }
            }
          })
        }

        const optimisticMessage: Message = {
          id: optimisticId,
          optimistic_id: optimisticId,
          reply: reply,
          attachments: props.attachments || [],
          content: props.content,
          has_content: !!props.content && props.content !== EMPTY_HTML,
          sender: membership,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          discarded_at: null,
          grouped_reactions: [],
          viewer_is_sender: true,
          viewer_can_delete: true,
          unfurled_link: null,
          call: null,
          shared_post_url: null
        }

        return {
          ...old,
          pages: [
            {
              ...old.pages[0],
              data: [optimisticMessage, ...old.pages[0].data]
            },
            ...old.pages.slice(1)
          ]
        }
      })

      setTypedQueriesData(queryClient, threadsQueryKey, (old) => {
        if (!old) return old
        return {
          ...old,
          threads: old.threads.sort((a, b) => {
            if (a.last_message_at && b.last_message_at) {
              return new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
            }
            return 0
          })
        }
      })

      return {
        optimisticId,
        ...createNormalizedOptimisticUpdate({
          queryNormalizer,
          type: 'thread',
          id: props.threadId,
          update: {
            // match the formatting of Message#preview_truncated to avoid flickering after receiving the response
            latest_message_truncated: `You: ${stripHtml(props.content)}`,
            last_message_at: new Date().toISOString()
          }
        })
      }
    },

    onSuccess(data, props, { optimisticId }) {
      onSuccess(data, props, optimisticId)
    },

    onError(error, _, context) {
      onError(error, context?.optimisticId)
    }
  })
}

type RetryProps = Props & { optimisticId: string }

export function useRetryCreateMessage() {
  const { scope } = useScope()
  const pusherSocketIdHeader = usePusherSocketIdHeader()
  const updateMutation = useSetAtom(updateCreateMessageStateAtom)
  const { onSuccess, onError } = useCreateMessageCallbacks()

  return useMutation({
    mutationFn: ({ threadId, attachments, optimisticId: _, ...data }: RetryProps) =>
      postThreadsMessages.request(
        `${scope}`,
        threadId,
        { attachments: transformAttachments(attachments), ...data },
        { headers: pusherSocketIdHeader }
      ),
    onMutate: async ({ optimisticId }) => {
      updateMutation({ optimisticId, status: 'pending' })
    },
    onSuccess(data, { optimisticId, ...props }) {
      onSuccess(data, props, optimisticId)
    },
    onError(error, { optimisticId }) {
      onError(error, optimisticId)
    }
  })
}
