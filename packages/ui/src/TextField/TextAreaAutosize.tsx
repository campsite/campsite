import { forwardRef, useLayoutEffect, useState } from 'react'
import ReactTextareaAutosize, { TextareaAutosizeProps } from 'react-textarea-autosize'

/*
  This is a workaround for a bug in react-textarea-autosize where
  the textarea doesn't resize on the first render. This usually happens
  when the textarea is used in a dialog, because the dialog "transitions" into a mounted
  state, and the textarea is not mounted until the dialog is mounted. As a result,
  the textarea doesn't know how tall to be; if the user starts typing or the dialog rerenders
  for any reason, it will resize correctly.

  This is a thin wrapper that re-renders the textarea after the first render.

  See https://github.com/Andarist/react-textarea-autosize/issues/337#issuecomment-1024980737
  for more details.
*/

export const TextareaAutosize = forwardRef<HTMLTextAreaElement, TextareaAutosizeProps>((props, ref) => {
  const [, setIsRerendered] = useState(false)

  useLayoutEffect(() => setIsRerendered(true), [])
  return <ReactTextareaAutosize {...props} ref={ref} />
})

TextareaAutosize.displayName = 'TextareaAutosize'
