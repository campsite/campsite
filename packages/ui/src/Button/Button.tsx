import { forwardRef } from 'react'
import { cva, VariantProps } from 'class-variance-authority'

import { Link, LinkProps } from '../Link'
import { Tooltip } from '../Tooltip'
import { cn } from '../utils'

export const ANIMATIONS = {
  whileTap: { scale: 0.9 },
  initial: { scale: 1 },
  animate: { scale: 1 },
  transition: {
    type: 'spring',
    stiffness: 600,
    damping: 30
  }
}

export const buttonVariants = cva(
  [
    'relative font-medium shrink-0 group inline-flex items-center justify-center select-none transform-gpu initial:border-none disabled:opacity-50',
    'focus:!outline-none focus:!ring-0 active:!outline-none active:!ring-0',
    'after:pointer-events-none after:absolute after:-inset-[3px] after:rounded-lg after:border after:border-blue-500 after:opacity-0 after:ring-2 after:ring-blue-500/20 after:transition-opacity focus-visible:after:opacity-100 active:after:opacity-0',
    'before:pointer-events-none before:bg-gradient-to-b before:transition-opacity before:from-white/[0.12] before:absolute before:inset-0 before:z-[1] before:rounded before:opacity-0'
  ],
  {
    variants: {
      variant: {
        base: [
          'bg-white dark:bg-gray-750',
          'text-gray-900 dark:text-gray-50',
          'shadow-button-base',
          'hover:before:opacity-100 dark:hover:before:opacity-50'
        ],
        primary: [
          'bg-gray-800 dark:bg-gray-100',
          'text-gray-50 dark:text-gray-900',
          'dark:shadow-button-primary',
          'hover:before:opacity-50'
        ],
        flat: ['bg-black/[0.06] hover:bg-black/[0.08] dark:bg-white/[0.08] dark:hover:bg-white/10'],
        plain: [
          'hover:bg-black/[0.06] dark:hover:bg-white/[0.08]',
          'data-[state=open]:bg-gray-150 dark:data-[state=open]:bg-gray-750',
          'disabled:hover:bg-transparent dark:disabled:hover:bg-transparent'
        ],
        destructive: ['bg-red-500', 'text-gray-50', 'hover:before:opacity-100'],
        important: [
          'bg-blue-500 dark:bg-blue-600',
          'text-white dark:text-gray-50',
          'dark:shadow-[0px_0px_4px_rgba(30,_58,_138,_0.6),_0px_0px_0px_0.5px_rgb(0_0_0_/_0.94),_inset_0px_0.5px_0px_rgba(255,_255,_255,_0.12),_inset_0px_0px_1px_0px_rgba(255,_255,_255,_0.4),_inset_0px_-4px_8px_-4px_rgba(30,_58,_138,_0.4)]',
          'hover:before:opacity-100'
        ],
        brand: [
          'bg-gradient-to-tl to-brand-primary from-brand-secondary saturate-[105%]',
          'text-white',
          'hover:before:opacity-100',
          'shadow-[inset_0px_0.5px_0px_rgb(255_255_255_/_0.32)]'
        ],
        onboarding: [
          'bg-green-600',
          'text-gray-50',
          'shadow-[0px_0px_4px_rgba(20,_83,_45,_0.1),_0px_0px_0px_0.5px_rgba(20,_83,_45,_0.6),_inset_0px_0.5px_0px_rgba(255,_255,_255,_0.08),_inset_0px_0px_1px_1px_rgba(255,_255,_255,_0.12),_inset_0px_-1px_1px_rgba(20,_83,_45,_0.24),_inset_0px_-4px_8px_-4px_rgba(20,_83,_45,_0.08)]',
          'dark:shadow-[0px_0px_4px_rgba(20,_83,_45,_0.4),_0px_0px_0px_0.5px_rgba(20,_83,_45,_0.94),_inset_0px_0.5px_0px_rgba(255,_255,_255,_0.24),_inset_0px_0px_1px_0px_rgba(255,_255,_255,_0.4),_inset_0px_-4px_8px_-4px_rgba(20,_83,_45,_0.4)]',
          'hover:before:opacity-100'
        ],
        text: ['!h-auto !p-0 text-blue-600 dark:text-blue-500'],
        none: ''
      },
      size: {
        // 13.01px font size so that chrome doesn't render it 1px vertically off center
        sm: ['h-6.5 text-[13.01px] rounded'],
        base: ['h-7.5 text-[14.01px] rounded-md'],
        large: ['px-10 h-10 py-3 text-[15.01px] rounded-lg']
      },
      fullWidth: {
        true: 'w-full flex-1'
      },
      loading: {
        true: 'opacity-50 cursor-wait'
      },
      rightSlot: {
        true: 'flex items-center justify-center'
      },
      round: {
        true: 'rounded-full after:rounded-full before:rounded-full'
      }
    },
    defaultVariants: {
      variant: 'base'
    }
  }
)

export interface ButtonProps {
  id?: string
  align?: 'center' | 'left'
  children?: React.ReactNode
  variant?: NonNullable<VariantProps<typeof buttonVariants>['variant']>
  accessibilityLabel?: string
  loading?: boolean
  disabled?: boolean
  leftSlot?: React.ReactNode
  rightSlot?: React.ReactNode
  onFocus?: (event: React.FocusEvent<HTMLButtonElement & HTMLAnchorElement>) => void
  onBlur?: (event: React.FocusEvent<HTMLButtonElement & HTMLAnchorElement>) => void
  onMouseEnter?: (event: React.MouseEvent<HTMLButtonElement & HTMLAnchorElement>) => void
  onMouseLeave?: (event: React.MouseEvent<HTMLButtonElement & HTMLAnchorElement>) => void
  onMouseDown?: (event: React.MouseEvent<HTMLButtonElement & HTMLAnchorElement>) => void
  onKeyDownCapture?: (event: React.KeyboardEvent<HTMLButtonElement & HTMLAnchorElement>) => void
  href?: LinkProps['href']
  className?: string
  fullWidth?: boolean
  iconOnly?: React.ReactNode
  type?: 'button' | 'submit' | 'reset'
  onClick?: (event: React.MouseEvent<HTMLButtonElement & HTMLAnchorElement>) => void
  onPointerDown?: (event: React.PointerEvent<HTMLButtonElement & HTMLAnchorElement>) => void
  onPointerUp?: (event: React.PointerEvent<HTMLButtonElement & HTMLAnchorElement>) => void
  tooltip?: string
  tooltipShortcut?: string
  autoFocus?: boolean
  externalLink?: boolean
  allowOpener?: boolean
  download?: string
  role?: string
  round?: boolean
  size?: NonNullable<VariantProps<typeof buttonVariants>['size']> | 'base'
  'aria-pressed'?: boolean | 'true' | 'false' | 'mixed' | undefined
  contentEditable?: boolean | 'true' | 'false' | 'inherit' | 'plaintext-only' | undefined
  title?: string
  isSelect?: boolean
}

export const Button = forwardRef<HTMLButtonElement & HTMLAnchorElement, ButtonProps>(
  (
    {
      id,
      align = 'center',
      accessibilityLabel,
      loading,
      children,
      disabled,
      href,
      iconOnly,
      variant,
      className,
      fullWidth,
      onFocus,
      leftSlot,
      rightSlot,
      onBlur,
      onClick,
      onKeyDownCapture,
      tooltip,
      tooltipShortcut,
      autoFocus,
      externalLink,
      allowOpener,
      type = 'button',
      download,
      role,
      round,
      size = 'base',
      'aria-pressed': ariaPressed,
      title,
      isSelect,
      ...props
    },
    ref
  ) => {
    if (iconOnly && !accessibilityLabel) {
      throw new Error('You must provide an accessibilityLabel to a button with iconOnly')
    }

    if (href) {
      return (
        <Tooltip disableHoverableContent label={tooltip} shortcut={tooltipShortcut}>
          <Link
            id={id}
            href={href}
            className={cn(
              'relative outline-none transition',
              buttonVariants({ variant, fullWidth, loading, size, round }),
              { '!pl-1': leftSlot && size === 'sm' },
              { '!pl-2': leftSlot && size === 'base' },
              { '!pl-4': leftSlot && size === 'large' },
              { '!pr-1': rightSlot && size === 'sm' },
              { '!pr-2': rightSlot && size === 'base' },
              { '!pr-4': rightSlot && size === 'large' },
              { 'w-6.5 p-0': iconOnly && size === 'sm' },
              { 'w-7.5 p-0': iconOnly && size === 'base' },
              { 'w-10 p-0': iconOnly && size === 'large' },
              { 'px-2': !iconOnly && size === 'sm' },
              { 'px-2.5': !iconOnly && size === 'base' },
              { 'px-4.5': !iconOnly && size === 'large' },
              { 'pointer-events-none opacity-50': disabled || loading },
              className
            )}
            ref={ref}
            onFocus={onFocus}
            onBlur={onBlur}
            title={tooltip ? undefined : (title ?? accessibilityLabel)}
            aria-label={accessibilityLabel}
            onClick={(e) => {
              if (onClick) onClick(e as React.MouseEvent<HTMLButtonElement & HTMLAnchorElement>)
              if (href && download) {
                e.preventDefault()
                downloadFile(href as string, download)
              }
            }}
            onKeyDownCapture={onKeyDownCapture}
            target={externalLink ? '_blank' : undefined}
            rel={externalLink ? (allowOpener ? 'opener' : 'noopener noreferrer') : undefined}
            role={role}
            draggable={false}
            {...props}
          >
            {iconOnly && iconOnly}
            <span
              className={cn('relative z-[2] flex items-center', {
                'gap-2': size === 'large',
                'gap-1.5': size === 'base',
                'gap-1': size === 'sm'
              })}
            >
              {leftSlot && <span className='inline-flex flex-none justify-center'>{leftSlot}</span>}
              <span>{children}</span>
              {rightSlot && <span className='inline-flex flex-none justify-center'>{rightSlot}</span>}
            </span>
          </Link>
        </Tooltip>
      )
    }

    return (
      <Tooltip disableHoverableContent label={tooltip} shortcut={tooltipShortcut}>
        <button
          id={id}
          className={cn(
            'outline-none',
            buttonVariants({ variant, fullWidth, loading, size, round }),
            { '!pl-1': leftSlot && size === 'sm' },
            { '!pl-2': leftSlot && size === 'base' },
            { '!pl-4': leftSlot && size === 'large' },
            { '!pr-1': rightSlot && size === 'sm' },
            { '!pr-2': rightSlot && size === 'base' },
            { '!pr-4': rightSlot && size === 'large' },
            { 'w-6.5 p-0': iconOnly && size === 'sm' },
            { 'w-7.5 p-0': iconOnly && size === 'base' },
            { 'w-10 p-0': iconOnly && size === 'large' },
            { 'px-2': !iconOnly && size === 'sm' },
            { 'px-2.5': !iconOnly && size === 'base' },
            { 'px-4.5': !iconOnly && size === 'large' },
            className
          )}
          ref={ref}
          type={type}
          onFocus={onFocus}
          onBlur={onBlur}
          title={tooltip ? undefined : (title ?? accessibilityLabel)}
          aria-label={accessibilityLabel}
          onClick={onClick}
          disabled={disabled}
          autoFocus={autoFocus}
          aria-pressed={ariaPressed}
          data-autofocus={autoFocus}
          onKeyDownCapture={onKeyDownCapture}
          {...props}
        >
          {iconOnly && iconOnly}
          <span
            className={cn('relative z-[2] flex items-center overflow-hidden', {
              grow: isSelect || align === 'left',
              'gap-2': size === 'large',
              'gap-1.5': size === 'base',
              'gap-1': size === 'sm'
            })}
          >
            {leftSlot && <span className='inline-flex flex-none justify-center'>{leftSlot}</span>}
            <span className={cn('truncate leading-normal', { 'flex-1 grow text-left': isSelect || align === 'left' })}>
              {children}
            </span>
            {rightSlot && <span className='inline-flex flex-none justify-center'>{rightSlot}</span>}
          </span>
        </button>
      </Tooltip>
    )
  }
)

export async function downloadFile(href: string, name: string) {
  const res = await fetch(href)
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')

  a.href = url
  a.download = name
  a.click()
  URL.revokeObjectURL(url)

  return true
}

Button.displayName = 'Button'
