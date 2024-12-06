import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import * as RadixHoverCard from '@radix-ui/react-hover-card'
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import { ScopeProvider } from 'jotai-scope'
import { Router } from 'next/router'

import { DismissibleLayer } from '../DismissibleLayer'
import { cn } from '../utils'

const globalWarmedUpAtom = atom(false)
const isHoveringAtom = atom(false)
const mousePositionAtom = atom<{ x: number; y: number } | undefined>(undefined)
const DEBUG = false

type Side = NonNullable<RadixHoverCard.HoverCardContentProps['side']>
const OPPOSITE_SIDE: Record<Side, Side> = {
  top: 'bottom',
  right: 'left',
  bottom: 'top',
  left: 'right'
}

interface RootProps extends React.PropsWithChildren {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  disabled?: boolean
  targetHref?: string
}

function Root(props: RootProps) {
  return (
    <ScopeProvider atoms={[isHoveringAtom]}>
      <InnerRoot {...props} />
    </ScopeProvider>
  )
}

function InnerRoot({ children, open, onOpenChange, disabled: _disabled, targetHref }: RootProps) {
  const [isWarmedUp] = useAtom(globalWarmedUpAtom)
  const [isLoadingLink, setIsLoadingLink] = useState(false)
  const disabled = _disabled || isLoadingLink

  // Disable card if it's open during target link navigation
  useEffect(() => {
    if (!targetHref) return

    const handleRouteStart = (href: string) => {
      if (href !== targetHref) return
      setIsLoadingLink(true)
    }

    const handleRouteDone = () => {
      setIsLoadingLink(false)
    }

    Router.events.on('routeChangeStart', handleRouteStart)
    Router.events.on('routeChangeComplete', handleRouteDone)
    Router.events.on('routeChangeError', handleRouteDone)

    return () => {
      Router.events.off('routeChangeStart', handleRouteStart)
      Router.events.off('routeChangeComplete', handleRouteDone)
      Router.events.off('routeChangeError', handleRouteDone)
    }
  }, [targetHref])

  const handleOpenChange = useCallback(
    (newVal: boolean) => {
      if (disabled) {
        // Close card if it's open and disabled
        if (open) onOpenChange?.(false)

        return
      }

      onOpenChange?.(newVal)
    },
    [disabled, open, onOpenChange]
  )

  if (open && disabled) onOpenChange?.(false)

  return (
    <RadixHoverCard.Root open={open} onOpenChange={handleOpenChange} openDelay={isWarmedUp ? 100 : 500} closeDelay={50}>
      {children}
    </RadixHoverCard.Root>
  )
}

interface TriggerProps extends React.PropsWithChildren {
  asChild?: boolean
}

function Trigger({ children, asChild }: TriggerProps) {
  const setIsHovering = useSetAtom(isHoveringAtom)
  const setMousePosition = useSetAtom(mousePositionAtom)

  return (
    <RadixHoverCard.Trigger
      data-hello='world'
      asChild={asChild}
      onMouseEnter={(e) => {
        setIsHovering(true)
        setMousePosition({ x: e.clientX, y: e.clientY })
      }}
      onMouseMove={(e) => {
        setMousePosition({ x: e.clientX, y: e.clientY })
      }}
      onMouseLeave={() => {
        setIsHovering(false)
        setMousePosition(undefined)
      }}
    >
      {children}
    </RadixHoverCard.Trigger>
  )
}

interface PredictionConeProps {
  sideOffset: number
}

function PredictionCone({ sideOffset }: PredictionConeProps) {
  const achorRef = useRef<HTMLDivElement>(null)
  const triggerMousePosition = useAtomValue(mousePositionAtom)
  const [predictionMousePosition, setPredictionMousePosition] = useState<{ x: number; y: number } | undefined>(
    undefined
  )
  const normalizedMousePosition = predictionMousePosition ?? triggerMousePosition

  const { width, clipPath } = useMemo(() => {
    if (!normalizedMousePosition || !achorRef.current) return {}

    const anchorRect = achorRef.current.getBoundingClientRect()
    // subtract 1 pixel to still allow hovering over trigger elements (i.e. remove button)
    const width = Math.max(0, anchorRect.x - normalizedMousePosition.x) - 1
    const yScale = Math.round(((normalizedMousePosition.y - anchorRect.y) / anchorRect.height) * 100)
    const clipPath = `polygon(100% 0%, 100% 100%, 0% ${yScale}%)`

    return { clipPath, width }
  }, [normalizedMousePosition])

  useEffect(() => {
    const timeout = setTimeout(() => {
      setPredictionMousePosition(undefined)
    }, 200)

    return () => clearTimeout(timeout)
  }, [predictionMousePosition])

  return (
    <>
      <div ref={achorRef} className='absolute -inset-y-5 left-0' />
      <div
        className={cn('absolute -inset-y-5 right-full cursor-pointer', {
          'bg-red-500/50': DEBUG
        })}
        style={{
          clipPath,
          width: `${width ?? sideOffset}px`
        }}
        onMouseEnter={(e) => setPredictionMousePosition({ x: e.clientX, y: e.clientY })}
        onMouseMove={(e) => setPredictionMousePosition({ x: e.clientX, y: e.clientY })}
        onMouseLeave={() => setPredictionMousePosition(undefined)}
      />
    </>
  )
}

interface ContentProps extends Omit<RadixHoverCard.HoverCardContentProps, 'hideWhenDetached'> {
  portalContainer?: string
}

function Content({
  children,
  side = 'right',
  align = 'start',
  sideOffset = 8,
  alignOffset = 0,
  collisionPadding = 8,
  portalContainer,
  className,
  ...props
}: ContentProps) {
  const container = portalContainer ? document.getElementById(portalContainer) : document.body

  return (
    <RadixHoverCard.Portal container={container}>
      <RadixHoverCard.Content
        {...props}
        side={side}
        align={align}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        collisionPadding={collisionPadding}
        hideWhenDetached
        className={cn(
          'animate-scale-fade shadow-popover dark:border-primary-opaque bg-primary relative flex h-[420px] w-[420px] flex-1 origin-[--radix-hover-card-content-transform-origin] flex-col rounded-lg border border-transparent dark:shadow-[0px_2px_16px_rgba(0,0,0,1)]',
          className,
          'overflow-visible' // prediction cone only works if we allow the triangle to "leak" beyond the bounds of the container
        )}
      >
        <DismissibleLayer>
          <>{children}</>
        </DismissibleLayer>

        <div
          className={cn('absolute -inset-5 -z-10', { 'bg-blue-500/50': DEBUG })}
          style={{
            [OPPOSITE_SIDE[side]]: '0'
          }}
        />

        <PredictionCone sideOffset={sideOffset} />
      </RadixHoverCard.Content>
    </RadixHoverCard.Portal>
  )
}

function ContentTitleBar({ children }: { children: React.ReactNode }) {
  return <div className='flex h-11 w-full flex-none items-center gap-0.5 border-b px-2'>{children}</div>
}

export const HoverCard = Object.assign(Root, {
  Trigger,
  Content: Object.assign(Content, {
    TitleBar: ContentTitleBar
  })
})
