import { cn } from './cn'

/**
 * @deprecated Use CONTAINER_STYLES.animation instead
 */
export const ANIMATION_CONSTANTS = {
  initial: { opacity: 0, scale: 0.94 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.1
    }
  },
  exit: {
    opacity: 0,
    scale: 0.94,
    transition: {
      duration: 0.1
    }
  }
}

export const CONTAINER_STYLES = {
  base: cn(
    'data-[side=bottom]:data-[align=end]:origin-top-right',
    'data-[side=bottom]:data-[align=start]:origin-top-left',
    'data-[side=bottom]:data-[align=center]:origin-top',
    'data-[side=top]:data-[align=end]:origin-bottom-right',
    'data-[side=top]:data-[align=start]:origin-bottom-left',
    'data-[side=top]:data-[align=center]:origin-bottom',
    'data-[side=left]:data-[align=end]:origin-bottom-right',
    'data-[side=left]:data-[align=start]:origin-top-right',
    'data-[side=left]:data-[align=center]:origin-right',
    'data-[side=right]:data-[align=end]:origin-bottom-left',
    'data-[side=right]:data-[align=start]:origin-top-left',
    'data-[side=right]:data-[align=center]:origin-left'
  ),
  animation: cn(
    'data-[state=open]:animate-in data-[state=closed]:animate-out',
    'data-[state=open]:duration-50 data-[state=closed]:duration-150',
    'data-[state=closed]:ease-in data-[state=open]:ease-out',
    'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
    'data-[state=closed]:zoom-out-[0.98] data-[state=open]:zoom-in-[0.98]',
    'origin-[--radix-context-menu-content-transform-origin] origin-[--radix-popover-content-transform-origin] origin-[--radix-dropdown-menu-content-transform-origin] origin-[--radix-hover-card-content-transform-origin]'
  ),
  borders: 'border-black/50 dark:border',
  background: 'bg-black dark:bg-elevated',
  shadows: 'shadow-popover',
  rounded: 'rounded-lg'
}

export const ALL_CONTAINER_STYLES = cn(
  CONTAINER_STYLES.base,
  CONTAINER_STYLES.borders,
  CONTAINER_STYLES.background,
  CONTAINER_STYLES.shadows,
  CONTAINER_STYLES.rounded
)
