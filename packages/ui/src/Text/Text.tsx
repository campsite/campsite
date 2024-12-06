'use client'

import React, { forwardRef } from 'react'

import { cn } from '../utils'

export interface BaseTextProps {
  /** The element name to use for the text */
  element?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div' | 'label'
  /** The content to display inside the heading */
  children?: React.ReactNode
  /** A unique identifier for the text, used for reference in anchor links  */
  id?: string
  /** Indicates hierarchy to control text color */
  primary?: boolean
  secondary?: boolean
  tertiary?: boolean
  quaternary?: boolean
  /** Inherits a parent element that sets the text color (link a link) */
  inherit?: boolean
  /** Allow limited overrides to font weight */
  weight?: 'font-normal' | 'font-medium' | 'font-semibold' | 'font-bold'
  /** Allow limited overrides to font size */
  size?: string
  /** Additiona classnames to override the base styles if needed */
  className?: string
  /** Allow text to be selected */
  selectable?: boolean
  /** Anything else */
  [key: string]: any
}

export const UIText = forwardRef<HTMLElement, BaseTextProps>(function UIText(
  {
    id = undefined,
    element: Element = 'p',
    className = '',
    weight = 'font-normal',
    size = 'text-sm',
    primary = false,
    secondary = false,
    tertiary = false,
    quaternary = false,
    inherit = false,
    selectable = false,
    ...rest
  },
  ref
) {
  const classes = cn(
    weight,
    size,
    {
      'text-inherit': inherit,
      'text-primary': primary && !inherit,
      'text-secondary': secondary && !inherit,
      'text-tertiary': tertiary && !inherit,
      'text-quaternary': quaternary && !inherit,
      'select-text': selectable
    },
    className
  )

  return <Element ref={ref as any} id={id} className={classes} {...rest} />
})

export function LargeTitle({
  element = 'h1',
  weight = 'font-bold',
  size = 'text-2xl md:text-4xl',
  ...rest
}: BaseTextProps) {
  return <UIText element={element} weight={weight} size={size} {...rest} />
}

export function Title1({
  element = 'h2',
  weight = 'font-medium',
  size = 'text-xl md:text-2xl',
  ...rest
}: BaseTextProps) {
  return <UIText element={element} weight={weight} size={size} {...rest} />
}

export function Title2({
  element = 'h2',
  weight = 'font-medium',
  size = 'text-lg md:text-xl',
  ...rest
}: BaseTextProps) {
  return <UIText element={element} weight={weight} size={size} {...rest} />
}

export function Title3({
  element = 'h2',
  weight = 'font-medium',
  size = 'text-md md:text-lg',
  ...rest
}: BaseTextProps) {
  return <UIText element={element} weight={weight} size={size} {...rest} />
}

export function Headline({ weight = 'font-medium', size = 'text-base', ...rest }: BaseTextProps) {
  return <UIText weight={weight} size={size} {...rest} />
}

export function Body({ secondary = true, size = 'text-base', ...rest }: BaseTextProps) {
  return <UIText secondary={secondary} size={size} {...rest} />
}

export function Caption({ secondary = true, size = 'text-xs', weight = 'font-medium', ...rest }: BaseTextProps) {
  return <UIText secondary={secondary} size={size} weight={weight} {...rest} />
}
