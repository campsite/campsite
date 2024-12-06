import { KeyboardEvent, useEffect, useState } from 'react'
import { AnimatePresence, motion, MotionConfig } from 'framer-motion'
import Select, { components, LoadingIndicatorProps, MenuProps, MultiValueGenericProps, OptionProps } from 'react-select'
import StateManagedSelect from 'react-select'

import { SyncOrganizationMember } from '@campsite/types/generated'
import { LoadingSpinner } from '@campsite/ui/index'
import { cn } from '@campsite/ui/utils'

import { GuestBadge } from '@/components/GuestBadge'
import { MemberAvatar } from '@/components/MemberAvatar'
import { MULTI_VALUE_PICKER_STYLES } from '@/utils/multiValuePickerStyles'

export interface OrganizationMemberMultiSelectOptionType {
  value: string
  label: string
  member: SyncOrganizationMember
}

export function organizationMemberToMultiSelectOption(
  member: SyncOrganizationMember
): OrganizationMemberMultiSelectOptionType {
  return {
    value: member.id,
    label: member.user.display_name,
    member
  }
}

function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
  if (event.key === 'Escape' && document.activeElement instanceof HTMLElement) {
    document.activeElement.blur()
  }
}

export function OrganizationMemberMultiSelect({
  className,
  ...rest
}: React.ComponentProps<typeof StateManagedSelect<OrganizationMemberMultiSelectOptionType, true>>) {
  return (
    <Select
      isMulti
      components={{ MultiValueContainer, Menu, LoadingIndicator, Option: CustomOption }}
      onKeyDown={handleKeyDown}
      className={cn('tag-picker', className)}
      styles={MULTI_VALUE_PICKER_STYLES}
      {...rest}
    />
  )
}

const LoadingIndicator = (props: LoadingIndicatorProps<OrganizationMemberMultiSelectOptionType>) => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    let timeout: any

    if (props.selectProps.isLoading) {
      timeout = setTimeout(() => setIsVisible(true), 500)
    } else {
      setIsVisible(false)
    }

    return () => clearTimeout(timeout)
  }, [props.selectProps.isLoading])

  if (!isVisible) return null

  return <LoadingSpinner />
}

const MultiValueContainer = (props: MultiValueGenericProps<OrganizationMemberMultiSelectOptionType>) => {
  const { children, ...rest } = props

  return (
    <MotionConfig transition={{ duration: 0.1 }}>
      <AnimatePresence>
        <motion.div
          key={props.data.id}
          layout
          initial={{ opacity: 0.5, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0.5, scale: 0.96 }}
          style={{ originX: 0.5 }}
          className={cn(props.data.member && 'max-w-[150px] truncate')}
        >
          <components.MultiValueContainer {...rest}>
            <div className='text-secondary'>
              <MemberAvatar member={props.data.member} size='xs' />
            </div>
            {children}
          </components.MultiValueContainer>
        </motion.div>
      </AnimatePresence>
    </MotionConfig>
  )
}

const Menu = (props: MenuProps<OrganizationMemberMultiSelectOptionType, true>) => {
  return <components.Menu {...props}>{props.children}</components.Menu>
}

const CustomOption = (props: OptionProps<OrganizationMemberMultiSelectOptionType>) => {
  return (
    <components.Option {...props}>
      <div className='grid grid-cols-[20px,1fr] items-center gap-1.5'>
        <MemberAvatar member={props.data.member} size='xs' />
        <div className='flex items-center gap-2 truncate'>
          {props.data.member.user.display_name}
          {props.data.member.role === 'guest' && <GuestBadge />}
        </div>
      </div>
    </components.Option>
  )
}
