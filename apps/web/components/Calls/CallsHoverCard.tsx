import { useMemo, useState } from 'react'
import { useAtomValue } from 'jotai'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'

import { Call, OrganizationCallsGetRequest } from '@campsite/types'
import { Button, Command, LoadingSpinner, UIText, VideoCameraIcon } from '@campsite/ui'
import { HoverCard } from '@campsite/ui/src/HoverCard'
import { cn } from '@campsite/ui/src/utils'

import { CallRow } from '@/components/Calls'
import { EmptyState } from '@/components/EmptyState'
import { sidebarCollapsedAtom } from '@/components/Layout/AppLayout'
import { useScope } from '@/contexts/scope'
import { useCreateCallRoom } from '@/hooks/useCreateCallRoom'
import { useGetCalls } from '@/hooks/useGetCalls'
import { useScopedStorage } from '@/hooks/useScopedStorage'
import { flattenInfiniteData } from '@/utils/flattenInfiniteData'
import { getGroupDateHeading } from '@/utils/getGroupDateHeading'
import { groupByDate } from '@/utils/groupByDate'

export function CallsHoverCard({
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
  const [filter, setFilter] = useScopedStorage<OrganizationCallsGetRequest['filter']>('calls-index-filter', undefined)
  const getCalls = useGetCalls({ enabled: open, filter })
  const calls = useMemo(
    () => groupByDate(flattenInfiniteData(getCalls.data) || [], (call) => call.created_at),
    [getCalls.data]
  )
  const hasCalls = !!Object.keys(calls).length
  const sidebarCollapsed = useAtomValue(sidebarCollapsedAtom)
  const isViewingCalls = router.pathname === '/[org]/calls'
  const disabled = _disabled || sidebarCollapsed || isViewingCalls
  const href = `/${scope}/calls`

  const { mutate: createCallRoom, isPending } = useCreateCallRoom()

  function onInstantCall() {
    createCallRoom(
      { source: 'new_call_button' },
      {
        onSuccess: (data) => {
          setTimeout(() => window.open(`${data?.url}?im=open`, '_blank'))
        },
        onError: () => {
          toast('Unable to start a call, try again.')
        }
      }
    )
  }

  return (
    <HoverCard open={open} onOpenChange={setOpen} disabled={disabled} targetHref={href}>
      <HoverCard.Trigger asChild>{children}</HoverCard.Trigger>
      <HoverCard.Content side={side} align={align} sideOffset={sideOffset} alignOffset={alignOffset}>
        <HoverCard.Content.TitleBar>
          <Button onClick={() => setFilter(undefined)} variant={filter === undefined ? 'flat' : 'plain'}>
            For me
          </Button>
          <Button
            className='mr-auto'
            onClick={() => setFilter('joined')}
            variant={filter === 'joined' ? 'flat' : 'plain'}
          >
            Joined
          </Button>
          <Button disabled={isPending} onClick={onInstantCall} variant='primary' className='ml-4'>
            New
          </Button>
        </HoverCard.Content.TitleBar>

        {hasCalls && <CallsList calls={calls} />}

        {!hasCalls && !getCalls.isLoading && (
          <div className='flex flex-1 items-center justify-center px-6 py-12'>
            <EmptyState
              title='No recorded calls yet'
              icon={<VideoCameraIcon className='text-quaternary' size={32} />}
            />
          </div>
        )}

        {!hasCalls && getCalls.isLoading && (
          <div className='flex flex-1 items-center justify-center px-6 py-12'>
            <LoadingSpinner />
          </div>
        )}
      </HoverCard.Content>
    </HoverCard>
  )
}

function CallsList({ calls }: { calls: Record<string, Call[]> }) {
  return (
    <Command
      className='scrollbar-hide flex max-h-[420px] flex-col gap-px overflow-y-auto overscroll-contain outline-none'
      disableAutoSelect
      focusSelection
    >
      <Command.List>
        {Object.entries(calls).map(([date, calls], i) => {
          const dateHeading = getGroupDateHeading(date)

          return (
            <div key={date} className='flex flex-col'>
              <div
                className={cn('bg-primary sticky top-0 z-10 border-b px-3 py-1.5', {
                  'mt-4': i !== 0
                })}
              >
                <UIText weight='font-medium' tertiary>
                  {dateHeading}
                </UIText>
              </div>

              <div className='p-2'>
                {calls.map((call) => (
                  <CallRow call={call} key={call.id} />
                ))}
              </div>
            </div>
          )
        })}
      </Command.List>
    </Command>
  )
}
