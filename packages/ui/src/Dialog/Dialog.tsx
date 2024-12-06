import React, { HTMLProps, useLayoutEffect, useRef, useState } from 'react'
import * as D from '@radix-ui/react-dialog'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'

import { Button } from '../Button'
import { DismissibleLayer } from '../DismissibleLayer'
import { useIsDesktopApp } from '../hooks'
import { CloseIcon } from '../Icons'
import { cn } from '../utils'

export type DialogSize = 'xs' | 'sm' | 'base' | 'medium' | 'lg' | 'xl' | '2xl' | '3xl' | 'fit' | 'full' | 'cover'
export interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
  size?: DialogSize
  fillHeight?: boolean
  align?: 'center' | 'top'
  onKeyDown?(event: React.KeyboardEvent<HTMLDivElement>): void
  trigger?: React.ReactNode
  portalContainer?: string
  onPointerDownOutside?(event: any): void
  onInteractOutside?(event: any): void
  visuallyHiddenTitle?: string
  visuallyHiddenDescription?: string
  disableDescribedBy?: boolean
}

export function Root({
  children,
  size = 'base',
  fillHeight = false,
  align = 'center',
  open,
  onOpenChange,
  onKeyDown,
  trigger,
  portalContainer,
  onPointerDownOutside,
  onInteractOutside = undefined,
  visuallyHiddenTitle,
  visuallyHiddenDescription,
  disableDescribedBy = false
}: DialogProps) {
  const isDesktopApp = useIsDesktopApp()
  const contentRef = useRef<HTMLDivElement>(null)

  let maxWidth

  switch (size) {
    case 'xs':
      maxWidth = 'max-w-[calc(100vw-32px)] sm:max-w-xs'
      break
    case 'sm':
      maxWidth = 'max-w-[calc(100vw-32px)] sm:max-w-sm'
      break
    default:
    case 'base':
      maxWidth = 'max-w-[calc(100vw-32px)] sm:max-w-md'
      break
    case 'lg':
      maxWidth = 'max-w-[calc(100vw-32px)] sm:max-w-lg'
      break
    case 'xl':
      maxWidth = 'max-w-[calc(100vw-32px)] sm:max-w-xl'
      break
    case '2xl':
      maxWidth = 'max-w-[calc(100vw-32px)] sm:max-w-2xl'
      break
    case '3xl':
      maxWidth = 'max-w-[calc(100vw-32px)] sm:max-w-3xl'
      break
    case 'fit':
      maxWidth = 'max-w-[calc(100vw-32px)] w-fit'
      break
    case 'full':
      maxWidth = 'max-w-[calc(100vw-32px)] sm:max-w-[calc(100vw-32px)]'
      break
    case 'cover':
      maxWidth = 'w-full'
      break
  }

  function dialogOpenChange(value: boolean) {
    onOpenChange(value)
    if (!value) {
      // HACK: Blur the dialog so that the focus is returned to the document body
      ;(document.activeElement as HTMLElement)?.blur()
    }
  }

  const needsFullHeight = size === 'full' || size === 'cover'
  const container = portalContainer ? document.getElementById(portalContainer) : document.body

  const [visualHeight, setVisualHeight] = useState<number | undefined>(undefined)

  useLayoutEffect(() => {
    // only enable visualViewport height adjustment for top aligned dialogs
    if (align !== 'top' || size === 'cover') return

    const onVisualViewportResize = () => {
      // only set the visual height if it's different than viewport height (aka keyboard is open)
      if (window.visualViewport?.height === window.innerHeight) return
      setVisualHeight(window.visualViewport?.height)
    }

    window.visualViewport?.addEventListener('resize', onVisualViewportResize)
    return () => window.visualViewport?.removeEventListener('resize', onVisualViewportResize)
  }, [align, setVisualHeight, size])

  const ariaProps = disableDescribedBy ? { 'aria-describedby': undefined } : {}

  return (
    <D.Root open={open} onOpenChange={dialogOpenChange} modal={portalContainer ? false : true}>
      {trigger && <D.Trigger asChild>{trigger}</D.Trigger>}

      {open && (
        <D.Portal forceMount container={container}>
          <D.Overlay asChild>
            <div className={cn('animate-backdrop fixed inset-0 bg-black/20 dark:bg-black/60')} />
          </D.Overlay>

          <DismissibleLayer>
            <D.Content
              asChild
              ref={contentRef}
              // must be an empty value to work
              disable-escape-layered-hotkeys=''
              onKeyDown={(e) => {
                onKeyDown?.(e)

                // Close the dialog when the escape key is pressed
                if (!e.defaultPrevented && e.key === 'Escape') {
                  e.preventDefault() // Prevents wrapping dialogs from also receiving the event
                  dialogOpenChange(false)
                }
              }}
              onInteractOutside={onInteractOutside}
              onPointerDownOutside={(e) => {
                if (onPointerDownOutside) return onPointerDownOutside(e)

                // This is needed to account for extensions, like Grammarly, which create their own UI on top of ours
                // See https://github.com/radix-ui/primitives/issues/1280#issuecomment-1319109163 for explainer
                if (!contentRef.current) return

                const contentRect = contentRef.current?.getBoundingClientRect()

                // Detect if click actually happened within the bounds of content.
                // This can happen if click was on an absolutely positioned element overlapping content,
                // such as the 1password extension icon in the text input, or a Grammarly suggestion.
                const actuallyClickedInside =
                  e.detail.originalEvent.clientX > contentRect.left &&
                  e.detail.originalEvent.clientX < contentRect.left + contentRect.width &&
                  e.detail.originalEvent.clientY > contentRect.top &&
                  e.detail.originalEvent.clientY < contentRect.top + contentRect.height

                if (actuallyClickedInside) {
                  e.preventDefault()
                }

                const target = e.target as HTMLElement
                const isGrammarly = target && target.hasAttribute('data-grammarly-shadow-root')

                if (isGrammarly) {
                  e.preventDefault()
                }
              }}
              onOpenAutoFocus={(e) => {
                if (!contentRef.current) return

                // Radix's open handler finds the first focusable element in the DOM and focuses it, clobbering our autofocus attribute.
                // That behavior is skipped if we preventDefault and implement our own logic. But we only implement preventDefault
                // if an element is found, otherwise it will default to focusing the trigger element behind the overlay.

                const autoFocusElement = contentRef.current.querySelector('[data-autofocus="true"]')

                if (autoFocusElement && 'focus' in autoFocusElement && typeof autoFocusElement.focus === 'function') {
                  e.preventDefault()
                  autoFocusElement.focus()
                }
              }}
              {...ariaProps}
            >
              <div
                onBlur={(event) => {
                  // Without this, any child element that blurs will propagate the event to the dialog.
                  // The dialog will then blur, which will trigger an automatic re-focus on the dialog
                  // and thus the blurred child element will be re-focused and never actually blur
                  event.stopPropagation()
                  event.preventDefault()
                }}
                className={cn(
                  'transition-all',
                  'fixed left-1/2 isolate w-full -translate-x-1/2 focus:outline-0',
                  'flex flex-col',
                  maxWidth,
                  align === 'top' && size !== 'cover'
                    ? fillHeight
                      ? 'top-[4dvh] h-full max-h-[calc(100dvh-env(safe-area-inset-bottom,0)-8vh)]'
                      : 'top-[10vh] max-h-[calc(100dvh-env(safe-area-inset-bottom,0)-20vh)]'
                    : 'top-1/2 -translate-y-1/2',
                  size !== 'cover' &&
                    align !== 'top' &&
                    (!isDesktopApp
                      ? 'max-h-[calc(100dvh-env(safe-area-inset-bottom,0)-env(safe-area-inset-top,0)-32px)]'
                      : 'max-h-[calc(100dvh-env(safe-area-inset-bottom,0)-env(safe-area-inset-top,0)-64px)]'),
                  needsFullHeight ? 'h-screen' : fillHeight ? undefined : 'h-auto',
                  {
                    'bg-elevated shadow-popover rounded-lg dark:bg-gray-900 dark:shadow-[inset_0_0.5px_0_rgb(255_255_255_/_0.08),_inset_0_0_1px_rgb(255_255_255_/_0.24),_0_0_0_0.5px_rgb(0,0,0,1),0px_0px_4px_rgba(0,_0,_0,_0.08),_0px_0px_10px_rgba(0,_0,_0,_0.12),_0px_0px_24px_rgba(0,_0,_0,_0.16),_0px_0px_80px_rgba(0,_0,_0,_0.2)]':
                      size !== 'cover',
                    'pt-8': isDesktopApp && size === 'full',
                    'bg-primary': size === 'cover'
                  }
                )}
                style={{
                  maxHeight: visualHeight ? `calc(${visualHeight}px - 12vh)` : undefined
                }}
              >
                {visuallyHiddenTitle && (
                  <VisuallyHidden asChild>
                    <D.Title>{visuallyHiddenTitle}</D.Title>
                  </VisuallyHidden>
                )}
                {visuallyHiddenDescription && (
                  <VisuallyHidden asChild>
                    <D.Description>{visuallyHiddenDescription}</D.Description>
                  </VisuallyHidden>
                )}

                {children}
              </div>
            </D.Content>
          </DismissibleLayer>
        </D.Portal>
      )}
    </D.Root>
  )
}

interface DefaultProps {
  children?: React.ReactNode
  asChild?: boolean
  className?: string
}

export function Header({ className, ...props }: DefaultProps) {
  return <header className={cn('flex-none rounded-t-lg p-4 text-sm', className)} {...props} />
}

export function Title({ className, ...props }: DefaultProps) {
  return <D.Title className={cn('flex-1 font-semibold', className)} {...props} />
}

export function Description({ className, ...props }: DefaultProps) {
  return <D.Description className={cn('text-secondary', className)} {...props} />
}

export function Content(props: DefaultProps & HTMLProps<HTMLDivElement>) {
  const { className, ...rest } = props

  return <div className={cn('initial:p-4 initial:pt-0 flex flex-1 flex-col overflow-y-auto', className)} {...rest} />
}

export function Footer(props: DefaultProps & { variant?: 'primary' | 'secondary' }) {
  const { variant = 'primary', className, ...rest } = props

  return (
    <footer
      className={cn('flex items-center rounded-b-lg border-t p-3', className, {
        'bg-secondary': variant == 'secondary'
      })}
      {...rest}
    />
  )
}

export function LeadingActions({ className, ...props }: DefaultProps) {
  return <div className={cn('flex flex-1 items-center justify-start gap-2', className)} {...props} />
}

export function TrailingActions({ className, ...props }: DefaultProps) {
  return <div className={cn('flex flex-1 items-center justify-end gap-2', className)} {...props} />
}

export function CloseButton({ className, ...props }: DefaultProps) {
  return (
    <D.Close
      // prevents this button from being autofocused instead of another focusable element in the dialog
      tabIndex={-1}
      asChild
    >
      <Button
        className={cn('absolute right-3 top-3', className)}
        variant='plain'
        iconOnly={<CloseIcon strokeWidth='2' />}
        accessibilityLabel='Close'
        tooltip='Close'
        tooltipShortcut='Esc'
        {...props}
      />
    </D.Close>
  )
}

export const Dialog = Object.assign(
  {},
  {
    Root,
    Header,
    Title,
    Description,
    Content,
    Footer,
    LeadingActions,
    TrailingActions,
    CloseButton
  }
)
