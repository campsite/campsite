import { forwardRef, useImperativeHandle, useRef } from 'react'

import { TextareaAutosize } from '@campsite/ui/TextField'
import { cn } from '@campsite/ui/utils'

interface Props {
  value: string | undefined
  onChange: (value: string) => void
  placeholder?: string
  onEnter?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
  onFocusNext?: () => void
  onBlur?: () => void
  autoFocus?: boolean
  readOnly?: boolean
  className?: string
}

export const TitleTextField = forwardRef<HTMLTextAreaElement, Props>(function TitleTextField(props, outerRef) {
  const { value, onChange, placeholder, onEnter, onFocusNext, onBlur, autoFocus, readOnly, className } = props
  const ref = useRef<HTMLTextAreaElement>(null)

  useImperativeHandle(outerRef, () => ref.current!, [])

  function onTitleKeydownCapture(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Escape') {
      ref.current?.blur()
    } else if (event.key === 'Enter') {
      event.preventDefault()
      event.stopPropagation()

      onEnter?.(event)
    } else if (ref.current && event.key === 'ArrowDown') {
      // create a clone element and split the text at the cursor
      // compare the height of that element to the height of the textarea
      // if the heights are equal, we are arrowing-down at the last line of the textarea so focus the editor
      const div = document.createElement('div')
      const computedStyle = window.getComputedStyle(ref.current)

      // @ts-ignore
      for (const key of computedStyle) {
        div.style.setProperty(key, computedStyle.getPropertyValue(key))
      }
      div.style.height = 'auto'
      const text = ref.current.value.substring(0, ref.current.selectionStart)

      // ensure there is text to measure
      div.textContent = text || '.'
      document.body.appendChild(div)
      const cursorHeight = div.getBoundingClientRect().height

      document.body.removeChild(div)

      // div and textarea auto height may differ by 1px
      if (cursorHeight >= ref.current.getBoundingClientRect().height - 1) {
        event.preventDefault()
        onFocusNext?.()
      }
    }
  }

  return (
    <TextareaAutosize
      ref={ref}
      className={cn(
        'scrollbar-hide w-full shrink-0 resize-none rounded-none border-0 bg-transparent p-0 outline-none focus:border-0 focus:outline-none focus:ring-0 dark:bg-transparent',
        className
      )}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      onKeyDownCapture={onTitleKeydownCapture}
      value={value}
      autoFocus={autoFocus}
      readOnly={readOnly}
      autoComplete='off'
    />
  )
})
