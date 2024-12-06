import { useState } from 'react'
import { useAtomValue } from 'jotai'
import { useRouter } from 'next/router'

import { MessageThread } from '@campsite/types'
import { Button, InboxIcon, Link, LoadingSpinner, UIText } from '@campsite/ui'
import { HoverCard } from '@campsite/ui/src/HoverCard'

import { CreateChatThreadDialog } from '@/components/Chat/CreateChatThreadDialog'
import { EmptyState } from '@/components/EmptyState'
import { sidebarCollapsedAtom } from '@/components/Layout/AppLayout'
import { useScope } from '@/contexts/scope'
import { useGetThreads } from '@/hooks/useGetThreads'

import { ExistingThreadListItem } from './ExistingThreadListItem'

export function ChatHoverList({
  children,
  side = 'right',
  align = 'start',
  sideOffset = 0,
  alignOffset = 0,
  disabled: _disabled = false
}: {
  children: React.ReactNode
  side?: 'left' | 'right' | 'top' | 'bottom'
  align?: 'start' | 'end' | 'center'
  sideOffset?: number
  alignOffset?: number
  disabled?: boolean
}) {
  const router = useRouter()
  const { scope } = useScope()
  const [open, setOpen] = useState(false)
  const { data: inbox, isLoading } = useGetThreads()
  const { threads } = inbox || {}
  const sidebarCollapsed = useAtomValue(sidebarCollapsedAtom)
  const isViewingChat = router.pathname.startsWith('/[org]/chat') && !router.query.focus
  const disabled = _disabled || sidebarCollapsed || isViewingChat
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const href = `/${scope}/chat`
  const hasChatThreads = !!threads?.length

  return (
    <>
      <HoverCard open={open} onOpenChange={setOpen} disabled={disabled} targetHref={href}>
        <HoverCard.Trigger asChild>{children}</HoverCard.Trigger>

        <HoverCard.Content side={side} align={align} sideOffset={sideOffset} alignOffset={alignOffset}>
          <HoverCard.Content.TitleBar>
            <Link href={href} onClick={() => setOpen(false)} className='flex flex-1 p-1'>
              <UIText weight='font-semibold' className='flex-1'>
                Chat
              </UIText>
            </Link>

            <Button
              variant='primary'
              onClick={() => {
                setOpen(false)
                setCreateDialogOpen(true)
              }}
            >
              New
            </Button>
          </HoverCard.Content.TitleBar>

          {hasChatThreads && <ThreadsList threads={threads} />}

          {!hasChatThreads && !isLoading && (
            <div className='flex flex-1 items-center justify-center px-6 py-12'>
              <EmptyState icon={<InboxIcon className='text-quaternary' size={44} />} />
            </div>
          )}

          {!hasChatThreads && isLoading && (
            <div className='flex flex-1 items-center justify-center px-6 py-12'>
              <LoadingSpinner />
            </div>
          )}
        </HoverCard.Content>
      </HoverCard>

      <CreateChatThreadDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
    </>
  )
}

function ThreadsList({ threads }: { threads: MessageThread[] | undefined }) {
  return (
    <div className='scrollbar-hide flex max-h-[400px] flex-col overflow-y-auto overscroll-contain p-2'>
      {threads?.map((thread) => <ExistingThreadListItem key={thread.id} thread={thread} />)}
    </div>
  )
}
