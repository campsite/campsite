import { useEffect } from 'react'

type Props = {
  containerId: string
  onCheckboxClick?: ({ index, checked }: { index: number; checked: boolean }) => void
}

export function useReadOnlyOnCheckboxClick({ containerId, onCheckboxClick }: Props) {
  useEffect(() => {
    const container = document.getElementById(containerId)

    if (!container || !onCheckboxClick) return

    const listener = (e: Event) => {
      const target = e.target as HTMLInputElement

      if (target.type !== 'checkbox') return

      const inputs = container.querySelectorAll('input[type="checkbox"]')

      if (!inputs?.length) return

      const index = Array.from(inputs).indexOf(target)

      onCheckboxClick({ index, checked: target.checked })

      // toggle the TaskList checked attribute to update styles immediately
      const li = target.closest('li')

      if (li) {
        li.dataset.checked = target.checked ? 'true' : 'false'
      }
    }

    container?.addEventListener('change', listener)

    return () => {
      container?.removeEventListener('change', listener)
    }
  }, [containerId, onCheckboxClick])
}
