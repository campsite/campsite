import React, { useRef, useState } from 'react'

import { Checkbox } from '@campsite/ui/Checkbox'

import { NodeHandler } from '.'

export interface TaskItemOptions {
  onCheckboxClick?: ({ index, checked }: { index: number; checked: boolean }) => void
}

export const TaskItem: NodeHandler<TaskItemOptions> = ({ node, onCheckboxClick, children }) => {
  const { checked: defaultChecked } = node.attrs ?? {}

  const itemRef = useRef<HTMLLIElement>(null)
  const [checked, setChecked] = useState(defaultChecked)

  const onChange = (checked: boolean) => {
    setChecked(checked)

    if (!itemRef.current || !onCheckboxClick) return

    const container = itemRef.current.closest('.prose')
    const checkbox = itemRef.current.querySelector('input[type="checkbox"]')

    if (!container || !checkbox) return

    const inputs = container.querySelectorAll('input[type="checkbox"]')

    if (!inputs?.length) return

    const index = Array.from(inputs).indexOf(checkbox)

    onCheckboxClick({ index, checked })
  }

  return (
    <li className='task-item flex items-center gap-3' ref={itemRef} data-checked={checked}>
      <Checkbox checked={checked} onChange={onChange} />
      <div className='flex-1'>{children}</div>
    </li>
  )
}
