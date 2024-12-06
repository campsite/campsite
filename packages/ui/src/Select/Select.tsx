'use client'

import * as React from 'react'
import { createContext, useContext } from 'react'

import { Button, ButtonProps, ChevronDownIcon, cn, LayeredHotkeys } from '../'
import { LayeredHotkeysProps } from '../DismissibleLayer/useLayeredHotkeys'
import { SelectOption, SelectPopover } from './SelectPopover'

interface SelectContextProps {
  options: readonly SelectOption[]
  disabled?: boolean
  open: boolean
  value: string
}
const SelectContext = createContext<SelectContextProps>({ options: [], open: false, value: '' })

interface Props<T extends SelectOption> {
  size?: ButtonProps['size']
  variant?: ButtonProps['variant']
  options: readonly T[]
  disabled?: boolean
  typeAhead?: boolean
  placeholder?: string
  value: T['value']
  customFilter?: (option: T) => boolean
  showCheckmark?: boolean
  showChevron?: boolean
  onChange: (value: T['value']) => void
  onQueryChange?: (value: string) => void
  onOpenChange?: (open: boolean) => void
  onKeyDownCapture?: (event: React.KeyboardEvent<HTMLInputElement>) => void
  children?: React.ReactNode
  portal?: boolean
  modal?: boolean
  side?: 'top' | 'bottom' | 'left' | 'right'
  align?: 'start' | 'center' | 'end'
  popoverWidth?: number | string
  shortcut?: Omit<LayeredHotkeysProps, 'callback'>
  dark?: boolean
}

export function Select<T extends SelectOption>(props: Props<T>) {
  const {
    size,
    variant = 'base',
    options,
    disabled,
    typeAhead,
    placeholder,
    value,
    customFilter,
    showCheckmark,
    showChevron = true,
    onChange,
    onQueryChange,
    onOpenChange,
    portal = true,
    modal = true,
    side = 'bottom',
    align = 'start',
    popoverWidth,
    shortcut,
    dark,
    children = (
      <SelectTrigger size={size} variant={variant} chevron={showChevron}>
        <SelectValue />
      </SelectTrigger>
    )
  } = props
  const [open, setOpen] = React.useState(false)

  const contextValue = React.useMemo(() => ({ options, disabled, open, value }), [options, disabled, open, value])

  return (
    <SelectContext.Provider value={contextValue}>
      {shortcut && <LayeredHotkeys callback={() => setOpen(true)} {...shortcut} />}

      <div className='flex'>
        <SelectPopover
          modal={modal}
          open={open}
          setOpen={setOpen}
          typeAhead={typeAhead}
          placeholder={placeholder}
          options={options}
          value={value}
          customFilter={customFilter}
          portal={portal}
          showCheckmark={showCheckmark}
          onChange={(value) => {
            setOpen(false)
            onChange?.(value)
          }}
          side={side}
          align={align}
          onQueryChange={onQueryChange}
          onOpenChange={onOpenChange}
          width={popoverWidth}
          dark={dark}
        >
          {children}
        </SelectPopover>
      </div>
    </SelectContext.Provider>
  )
}

type SelectTriggerProps = ButtonProps & {
  leftSlot?: React.ReactNode
  className?: string
  chevron?: React.ReactNode
  variant?: ButtonProps['variant']
  children?: React.ReactNode
}

export const SelectTrigger = React.forwardRef<HTMLButtonElement & HTMLAnchorElement, SelectTriggerProps>(
  function SelectTrigger(props, ref) {
    const {
      size,
      leftSlot,
      className,
      variant = 'base',
      children = <SelectValue />,
      chevron = true,
      onKeyDownCapture,
      ...rest
    } = props
    const { options, disabled, value } = useContext(SelectContext)

    const activeItem = React.useMemo(
      () =>
        options?.find((option) => {
          return option.value === value
        }),
      [options, value]
    )

    return (
      <Button
        size={size}
        ref={ref}
        fullWidth
        disabled={disabled || options.length === 0}
        className={className}
        role='combobox'
        variant={variant}
        isSelect
        leftSlot={leftSlot ?? activeItem?.leftSlot}
        rightSlot={chevron ? <ChevronDownIcon className='text-tertiary' /> : undefined}
        onKeyDownCapture={onKeyDownCapture}
        {...rest}
      >
        {children}
      </Button>
    )
  }
)

interface SelectValueProps {
  className?: string
  getSelectedLabel?: (value: string) => string | null
  placeholder?: string
}

export function SelectValue(props: SelectValueProps) {
  const { className, getSelectedLabel, placeholder } = props
  const { options, value } = useContext(SelectContext)

  return (
    <span className={cn(className, 'truncate')}>
      {getSelectedLabel?.(value) ?? options.find((option) => option.value === value)?.label ?? placeholder}
    </span>
  )
}
