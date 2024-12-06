import React, { useEffect, useRef } from 'react'
import { useSetAtom } from 'jotai'
import { useInView } from 'react-intersection-observer'

import { CloseIcon, Link, LinkProps, LockIcon, Tooltip } from '@campsite/ui'
import { cn } from '@campsite/ui/src/utils'

import { setUnreadSidebarItemIdsAtom } from '@/components/Sidebar/SidebarMoreUnreads'
import { useMergeRefs } from '@/hooks/useMergeRefs'

export const getSidebarLinkId = (id: string) => `sidebar-link-${id}`

type SidebarElement = React.ElementRef<'div'>
export interface SidebarLinkProps extends React.ComponentPropsWithoutRef<'div'> {
  id: string
  as?: LinkProps['as']
  href?: string | LinkProps['href']
  external?: boolean
  label: string
  labelAccessory?: React.ReactNode
  unread?: boolean
  isPrivate?: boolean
  active?: boolean
  leadingAccessory?: React.ReactNode
  trailingAccessory?: React.ReactNode
  onClick?: () => void
  onRemove?: (id: string) => void
  removeTooltip?: string
  onMouseEnter?: () => void
  onMouseLeave?: () => void
  className?: string
  scroll?: boolean
  disabled?: boolean
}

export const SidebarLink = React.forwardRef<SidebarElement, SidebarLinkProps>(
  (
    {
      id,
      active,
      leadingAccessory,
      trailingAccessory,
      as,
      href,
      label,
      labelAccessory,
      unread,
      isPrivate,
      onClick,
      onRemove,
      removeTooltip,
      onMouseEnter,
      onMouseLeave,
      external,
      className,
      scroll,
      disabled,
      ...props
    },
    forwardedRef
  ) => {
    const prevUnreadRef = useRef<boolean | undefined>(unread)
    const setUnreadSidebarItemIds = useSetAtom(setUnreadSidebarItemIdsAtom)

    const { ref } = useInView({
      threshold: 0.5,
      skip: !unread,
      onChange(inView) {
        if (inView) setUnreadSidebarItemIds({ type: 'remove', id })
        else setUnreadSidebarItemIds({ type: 'add', id })
      }
    })
    const setRefs = useMergeRefs(ref, forwardedRef)

    // Clean up atom state when item is marked as read from elsewhere
    useEffect(() => {
      if (prevUnreadRef.current === unread) return
      if (prevUnreadRef.current && !unread) setUnreadSidebarItemIds({ type: 'remove', id })
      prevUnreadRef.current = unread
    }, [unread, setUnreadSidebarItemIds, id])

    return (
      <div
        {...props}
        ref={setRefs}
        id={getSidebarLinkId(id)}
        className='group/sidebar-link relative flex min-w-0 flex-1'
      >
        {href && (
          <Link
            aria-disabled={disabled}
            href={href}
            as={as}
            target={external ? '_blank' : undefined}
            rel={external ? 'noopener noreferrer' : undefined}
            className={cn(
              'h-7.5 group-[[data-state="open"]]/sidebar-link:bg-quaternary group-[[data-state="open"]]/sidebar-link:text-primary relative flex w-full items-center gap-2 rounded-md p-1.5 font-medium',
              {
                'text-primary dark:bg-gray-750 bg-quaternary': active,
                'text-tertiary group-hover/sidebar-link:bg-quaternary group-hover/sidebar-link:text-primary': !active
              },
              className
            )}
            onClick={onClick}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            draggable={false}
            scroll={scroll}
          >
            {leadingAccessory && <span className={cn(unread && 'text-primary')}>{leadingAccessory}</span>}
            <span
              className={cn(
                'flex flex-1 items-center gap-1.5 truncate text-sm',
                // prevent remove button from overlapping content
                !!onRemove && 'max-w-[calc(100%-52px)]'
              )}
            >
              <span
                className={cn(
                  'group-hover/sidebar-link:bg-quaternary truncate',
                  !unread && 'opacity-85 group-hover/sidebar-link:opacity-100',
                  unread && 'text-primary font-[750] opacity-100'
                )}
              >
                {label}
              </span>
              {labelAccessory && <span>{labelAccessory}</span>}

              {isPrivate && <LockIcon size={16} strokeWidth='2' className='text-quaternary flex-none' />}
            </span>
            {trailingAccessory && <>{trailingAccessory}</>}
          </Link>
        )}

        {!href && (
          <button
            disabled={disabled}
            onClick={onClick}
            onMouseEnter={onMouseEnter}
            className={cn(
              'h-7.5 group-[[data-state="open"]]/sidebar-link:bg-quaternary group-[[data-state="open"]]/sidebar-link:text-primary relative flex w-full items-center gap-2 rounded-md p-1.5 text-left font-medium',
              {
                'text-primary dark:bg-gray-750 bg-quaternary': active,
                'text-tertiary group-hover/sidebar-link:bg-quaternary group-hover/sidebar-link:text-primary': !active
              },
              className
            )}
          >
            {leadingAccessory && <span className={cn(unread && 'text-primary')}>{leadingAccessory}</span>}
            <span
              className={cn(
                'flex-1 truncate text-sm',
                // prevent remove button from overlapping content
                !!onRemove && 'max-w-[calc(100%-52px)]',
                !unread && 'opacity-85 group-hover/sidebar-link:opacity-100',
                unread && 'text-primary font-[750] opacity-100'
              )}
            >
              {label}
            </span>
            {trailingAccessory && <>{trailingAccessory}</>}
          </button>
        )}

        {onRemove && (
          <Tooltip label={removeTooltip} disableHoverableContent>
            <button
              disabled={disabled}
              aria-label='Remove'
              onClick={(e) => {
                e.stopPropagation()
                onRemove(id)
              }}
              className={cn(
                'hover:text-primary bg-quaternary text-tertiary absolute right-0.5 top-1/2 z-[1] -translate-y-1/2 rounded p-1 opacity-0',
                'focus:opacity-100 group-hover/sidebar-link:opacity-100 group-[[data-state="open"]]/sidebar-link:opacity-100'
              )}
            >
              <CloseIcon size={16} strokeWidth='2' />
            </button>
          </Tooltip>
        )}
      </div>
    )
  }
)
SidebarLink.displayName = 'SidebarLink'
