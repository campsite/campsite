import { cn, EyeHideIcon, Link, UIText } from '@campsite/ui'

import { HTMLRenderer } from '@/components/HTMLRenderer'
import { CallBreadcrumbIcon } from '@/components/Titlebar/BreadcrumbPageIcons'
import { useScope } from '@/contexts/scope'
import { useGetCall } from '@/hooks/useGetCall'

interface Props {
  className?: string
  callId: string
  interactive?: boolean
}

export function CallPreviewCard({ className, callId, interactive }: Props) {
  const { scope } = useScope()
  const { data: call, isError } = useGetCall({ id: callId })

  if (isError) {
    return (
      <div className='text-tertiary bg-secondary flex flex-1 flex-col items-start justify-center gap-3 rounded-lg border p-4 lg:flex-row lg:items-center'>
        <EyeHideIcon className='flex-none' size={24} />
        <UIText inherit>Call not found — it may be private or deleted</UIText>
      </div>
    )
  }

  if (!call) {
    return (
      <div
        className={cn(
          'bg-primary dark:bg-secondary min-h-22 relative w-full overflow-hidden rounded-lg border',
          className
        )}
      ></div>
    )
  }

  return (
    <div className='bg-elevated not-prose min-h-22 relative flex w-full items-center gap-2 overflow-hidden rounded-lg border p-3'>
      {interactive && <Link href={`/${scope}/calls/${call.id}`} className='absolute inset-0 z-0' />}

      <span className='h-7.5 w-7.5 relative flex items-center justify-center self-start'>
        <CallBreadcrumbIcon />
      </span>

      <div className='flex-1'>
        <UIText weight='font-medium' size='text-[15px]' className='line-clamp-1'>
          {call.title}
        </UIText>

        {call.summary_html && (
          <HTMLRenderer
            className='text-tertiary break-anywhere line-clamp-2 w-full select-text text-sm'
            text={call.summary_html}
          />
        )}
      </div>
    </div>
  )
}
