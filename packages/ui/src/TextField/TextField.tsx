import React, { forwardRef, KeyboardEvent, useRef } from 'react'
import toast from 'react-hot-toast'

import { Button } from '../Button'
import { useCopyToClipboard } from '../hooks'
import { ClipboardIcon } from '../Icons'
import { UIText } from '../Text'
import { Tooltip } from '../Tooltip'
import { cn } from '../utils'
import { isMetaEnter } from '../utils/isMetaEnter'
import { LimitIndicator } from './LimitIndicator'
import { TextareaAutosize } from './TextAreaAutosize'

type InputType =
  | 'text'
  | 'email'
  | 'number'
  | 'password'
  | 'search'
  | 'tel'
  | 'url'
  | 'date'
  | 'datetime-local'
  | 'month'
  | 'time'
  | 'week'
  | 'currency'

interface Props {
  label?: string | React.ReactNode
  labelHidden?: boolean
  inlineError?: string | null
  helpText?: React.ReactNode
  id?: string
  name?: string
  type?: InputType
  value?: string
  placeholder?: string
  required?: boolean
  minLength?: number
  maxLength?: number
  // only applicable to multiline inputs
  minRows?: number
  // only applicable to multiline inputs
  maxRows?: number
  autoComplete?: string
  autoFocus?: boolean
  clickToCopy?: boolean | (() => void)
  readOnly?: boolean
  disabled?: boolean
  multiline?: boolean
  prefix?: string
  onChange?(value: string): void
  onPaste?(event: React.ClipboardEvent): void
  onFocus?: (event?: React.FocusEvent) => void
  onBlur?(event?: React.FocusEvent): void
  onKeyDown?(event: React.KeyboardEvent): void
  onKeyDownCapture?(event?: React.KeyboardEvent): void
  onCommandEnter?(event?: React.KeyboardEvent): void
  resize?: boolean
  indicatorThreshold?: number
  additionalClasses?: string
  containerClasses?: string
  inputClasses?: string
}

export function TextFieldLabel({
  children,
  labelHidden,
  htmlFor
}: {
  children: React.ReactNode
  labelHidden?: boolean
  htmlFor?: string
}) {
  return (
    <UIText
      element='label'
      secondary
      weight='font-medium'
      className={cn('mb-1.5', {
        'sr-only': labelHidden
      })}
      size='text-xs'
      htmlFor={htmlFor}
    >
      {children}
    </UIText>
  )
}

export function TextFieldError({ children }: { children: React.ReactNode }) {
  return <UIText className='mt-2 border-l-2 border-red-600 pl-3 text-red-600'>{children}</UIText>
}

export const TextField = forwardRef<HTMLInputElement, Props>(function TextField(props, ref) {
  const {
    label = null,
    labelHidden,
    inlineError,
    helpText,
    id,
    name,
    type = 'text',
    value,
    placeholder,
    required,
    minLength,
    maxLength,
    minRows,
    maxRows = 100,
    autoComplete,
    autoFocus = false,
    clickToCopy = false,
    readOnly = false,
    onChange,
    onPaste,
    onKeyDown,
    onKeyDownCapture,
    onCommandEnter,
    onFocus,
    onBlur,
    disabled,
    multiline,
    prefix,
    indicatorThreshold,
    additionalClasses,
    containerClasses,
    inputClasses: inputClassesProp
  } = props

  const inputRef = useRef<HTMLInputElement | null>(null)
  const textAreaRef = useRef<HTMLTextAreaElement>(null)
  const [copy] = useCopyToClipboard()
  const [currentLength, setCurrentLength] = React.useState<number>(0)

  function handleChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    if (maxLength) {
      setCurrentLength(event.currentTarget.value.length)
    }
    onChange && onChange(event.currentTarget.value)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) {
    onKeyDown?.(event)
    if (isMetaEnter(event) && onCommandEnter) {
      onCommandEnter(event)
    }
  }

  async function handleCopyClick() {
    const input = multiline ? textAreaRef.current : inputRef.current

    input?.select()
    await copy(value as string)
    toast('Copied to clipboard')

    if (clickToCopy && typeof clickToCopy === 'function') {
      clickToCopy()
    }
  }

  const labelMarkup =
    typeof label === 'string' ? (
      <TextFieldLabel labelHidden={labelHidden} htmlFor={id ?? name}>
        {label}
      </TextFieldLabel>
    ) : (
      label
    )

  const prefixMarkup = prefix ? (
    <div className='bg-secondary dark:bg-quaternary relative flex min-h-full items-center rounded-l-md border border-r-0 px-2'>
      <UIText tertiary>{prefix}</UIText>
    </div>
  ) : null

  const helpMarkup = helpText ? (
    <div className='text-tertiary mt-2'>
      <UIText size='text-xs' inherit>
        {helpText}
      </UIText>
    </div>
  ) : null

  const errorMarkup = inlineError ? <TextFieldError>{inlineError}</TextFieldError> : null

  const copyMarkup = clickToCopy ? (
    <Tooltip side='top' label='Copy'>
      <span className='absolute right-px top-px'>
        <Button
          variant='plain'
          iconOnly={<ClipboardIcon />}
          onClick={handleCopyClick}
          accessibilityLabel='Copy to clipboard'
        />
      </span>
    </Tooltip>
  ) : null

  const inputClasses = cn(
    'text-sm no-drag border-primary invalid:text-red-500 relative bg-primary dark:bg-quaternary border pl-2 w-full text-primary rounded-md h-8 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:invalid:text-primary focus:invalid:border-blue-600 focus:ring-blue-100 focus:invalid: dark:focus:ring-blue-600/40',
    {
      'border-red-600 focus:ring-red-100 bg-red-50 focus:border-red-600': inlineError,
      'pr-10': clickToCopy,
      'text-opacity-50': readOnly,
      'rounded-md': !prefix,
      'rounded-l-none': prefix,
      'opacity-50': disabled,
      'overflow-y-auto scrollbar-hide': multiline,
      truncate: !multiline,
      'resize-none': true,
      'pb-6': multiline,
      'pr-8': maxLength,
      [additionalClasses ?? '']: !!additionalClasses
    },
    inputClassesProp
  )

  const inputMarkup = multiline ? (
    <TextareaAutosize
      id={id}
      name={name}
      readOnly={readOnly}
      className={inputClasses}
      style={{ fontFeatureSettings: "'calt' 0" }}
      value={value}
      placeholder={placeholder}
      onChange={handleChange}
      onKeyDownCapture={onKeyDownCapture}
      onKeyDown={handleKeyDown}
      onFocus={onFocus}
      onBlur={onBlur}
      onClick={clickToCopy ? handleCopyClick : undefined}
      required={required}
      autoComplete={autoComplete}
      autoFocus={autoFocus}
      ref={textAreaRef}
      disabled={disabled}
      minRows={minRows}
      maxRows={maxRows}
      maxLength={maxLength}
      minLength={minLength}
    />
  ) : (
    <input
      type={type}
      id={id}
      name={name}
      readOnly={readOnly}
      className={inputClasses}
      style={{ fontFeatureSettings: "'calt' 0" }}
      value={value}
      placeholder={placeholder}
      onChange={handleChange}
      onPaste={onPaste}
      onKeyDownCapture={onKeyDownCapture}
      onKeyDown={handleKeyDown}
      onFocus={onFocus}
      onBlur={onBlur}
      onClick={clickToCopy ? handleCopyClick : undefined}
      required={required}
      autoComplete={autoComplete}
      autoFocus={autoFocus}
      minLength={minLength}
      maxLength={maxLength}
      ref={(value) => {
        if (typeof ref === 'function') {
          ref(value)
        } else if (ref) {
          ref.current = value
        }

        inputRef.current = value
      }}
      disabled={disabled}
      // no reason for 1Password to interact with in-product text fields
      data-1p-ignore
    />
  )

  return (
    <div className={cn('relative flex flex-col', containerClasses)}>
      {labelMarkup}
      <div className='relative flex flex-1'>
        {prefixMarkup}
        {inputMarkup}
        {maxLength && (
          <div
            className={cn('absolute', {
              'bottom-2 right-2': multiline,
              'right-2 top-1/2 -translate-y-1/2': !multiline
            })}
          >
            <LimitIndicator maxLength={maxLength} currentLength={currentLength} charThreshold={indicatorThreshold} />
          </div>
        )}

        {copyMarkup}
      </div>
      {helpMarkup}
      {errorMarkup}
    </div>
  )
})
