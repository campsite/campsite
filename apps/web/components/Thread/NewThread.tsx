import { useAtomValue, useSetAtom } from 'jotai'
import { useRouter } from 'next/router'

import { MessageThread, OauthApplication, OrganizationMember } from '@campsite/types/generated'
import { Avatar, LazyLoadingSpinner, Link } from '@campsite/ui'

import { attachmentsAtom, clearRepliesAtom, inReplyToAtom } from '@/components/Chat/atoms'
import { MemberAvatar } from '@/components/MemberAvatar'
import { MemberStatus } from '@/components/MemberStatus'
import { Composer } from '@/components/Thread/Composer'
import { ThreadSplitView } from '@/components/ThreadSplitView'
import { DeactivatedMemberThreadComposer } from '@/components/ThreadView/DeactivatedMemberThreadComposer'
import { BreadcrumbLabel, BreadcrumbTitlebar } from '@/components/Titlebar/BreadcrumbTitlebar'
import { useScope } from '@/contexts/scope'
import { useCreateMessage } from '@/hooks/useCreateMessage'
import { useCreateThread } from '@/hooks/useCreateThread'
import { useGetDm } from '@/hooks/useGetDm'
import { useGetIntegrationDm } from '@/hooks/useGetIntegrationDm'
import { useGetOauthApplication } from '@/hooks/useGetOauthApplication'
import { useGetOrganizationMember } from '@/hooks/useGetOrganizationMember'
import { useUploadChatAttachments } from '@/hooks/useUploadChatAttachments'

export function NewMemberThread({ username }: { username: string }) {
  const { data: existingThread, isLoading: isLookingUpThread } = useGetDm({ username })
  const { data: existingMember, isLoading: isLookingUpTarget } = useGetOrganizationMember({ username })

  return (
    <NewThread
      existingThread={existingThread?.dm}
      existingMember={existingMember}
      isLookingUpTarget={isLookingUpTarget}
      isLookingUpThread={isLookingUpThread}
    />
  )
}

export function NewIntegrationThread({ oauthApplicationId }: { oauthApplicationId: string }) {
  const { data: existingThread, isLoading: isLookingUpThread } = useGetIntegrationDm({ oauthApplicationId })
  const { data: existingApplication, isLoading: isLookingUpTarget } = useGetOauthApplication(oauthApplicationId)

  return (
    <NewThread
      existingThread={existingThread?.dm}
      existingOauthApplication={existingApplication}
      isLookingUpTarget={isLookingUpTarget}
      isLookingUpThread={isLookingUpThread}
    />
  )
}

function RedirectToThread({ threadId }: { threadId: string }) {
  const router = useRouter()

  router.replace(`/${router.query.org}/chat/${threadId}`)

  return null
}

interface NewThreadProps {
  existingThread?: MessageThread | null
  existingMember?: OrganizationMember | null
  existingOauthApplication?: OauthApplication | null
  isLookingUpThread?: boolean
  isLookingUpTarget?: boolean
}

export function NewThread({
  existingThread,
  existingMember,
  existingOauthApplication,
  isLookingUpTarget,
  isLookingUpThread
}: NewThreadProps) {
  const router = useRouter()
  const { scope } = useScope()

  const createThread = useCreateThread()
  const inReplyTo = useAtomValue(inReplyToAtom)
  const clearReplies = useSetAtom(clearRepliesAtom)
  const attachments = useAtomValue(attachmentsAtom)

  const createMessage = useCreateMessage()

  const hasTarget = !!existingMember || !!existingOauthApplication

  function onMessage(message: string) {
    if (!hasTarget) return

    if (existingThread) {
      createMessage.mutate(
        {
          threadId: existingThread.id,
          content: message,
          attachments,
          reply_to: inReplyTo?.id
        },
        {
          onSuccess: () => {
            router.replace(`/${scope}/chat/${existingThread.id}`)

            clearReplies()
          }
        }
      )

      return
    }

    createThread.mutate(
      {
        content: message,
        member_ids: existingMember ? [existingMember.id] : [],
        oauth_application_ids: existingOauthApplication ? [existingOauthApplication.id] : [],
        attachments: attachments
      },
      {
        onSuccess: (thread) => {
          router.replace(`/${scope}/chat/${thread.id}`)

          clearReplies()
        }
      }
    )
  }

  const isSearchingForExistingThread = isLookingUpThread
  const canSend = !isSearchingForExistingThread && hasTarget
  const { dropzone, onPaste, onUpload } = useUploadChatAttachments({ enabled: true })

  if (isLookingUpTarget) {
    return (
      <div className='flex flex-1 items-center justify-center'>
        <LazyLoadingSpinner />
      </div>
    )
  }

  if (existingThread) return <RedirectToThread threadId={existingThread.id} />

  return (
    <ThreadSplitView>
      <div className='flex flex-1 flex-col' {...dropzone.getRootProps()}>
        <BreadcrumbTitlebar>
          {existingMember && (
            <>
              <Link href={`/${scope}/people/${existingMember.user.username}`} className='flex items-center gap-3'>
                <MemberAvatar displayStatus member={existingMember} size='base' />
                <BreadcrumbLabel>{existingMember?.user.display_name}</BreadcrumbLabel>
                <MemberStatus size='lg' status={existingMember?.status} />
              </Link>
            </>
          )}
          {existingOauthApplication && (
            <>
              <div className='flex items-center gap-3'>
                <Avatar urls={existingOauthApplication.avatar_urls} size='base' rounded='rounded-md' />
                <BreadcrumbLabel>{existingOauthApplication.name}</BreadcrumbLabel>
              </div>
            </>
          )}
        </BreadcrumbTitlebar>

        <div className='flex-1' />

        {existingMember?.deactivated ? (
          <DeactivatedMemberThreadComposer />
        ) : (
          <Composer
            onMessage={onMessage}
            canSend={canSend}
            autoFocus={true}
            dropzone={dropzone}
            onPaste={onPaste}
            onUpload={onUpload}
          />
        )}
      </div>
    </ThreadSplitView>
  )
}
