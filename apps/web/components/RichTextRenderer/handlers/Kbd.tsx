import { isWindows } from 'react-device-detect'

import { NodeHandler } from '.'

export const Kbd: NodeHandler<{ textContent?: string }> = (props) => {
  let label = props.textContent

  if (label === 'Mod') {
    label = isWindows ? 'Ctrl' : '⌘'
  } else if (label === 'Option' || label === 'Alt') {
    label = isWindows ? 'Alt' : '⌥'
  } else if (label === 'Shift') {
    label = '⇧'
  }

  return <kbd className='bg-quaternary rounded-md border px-1 py-0.5 font-mono text-[13px] font-medium'>{label}</kbd>
}
