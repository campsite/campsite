import { useEffect, useState } from 'react'

import { handleMentionClick, isAppMention } from '@campsite/ui/Link'

import { useScope } from '@/contexts/scope'

export function useMentionInteraction(ref: React.RefObject<HTMLElement>) {
  const { scope } = useScope()
  const [hoveredMention, setHoveredMention] = useState<HTMLElement | null>(null)

  useEffect(() => {
    if (!ref.current) return
    const container = ref.current
    const selector = 'span[data-type="mention"][data-username]'

    const clickListener = (e: MouseEvent) => {
      if (handleMentionClick(`${scope}`, e, container.isContentEditable)) {
        e.preventDefault()
      }
    }

    const hoverListener = (e: MouseEvent) => {
      const target = e.target as HTMLElement // currently hovered element (ideally a mention)

      if (target.matches(selector) && e.type === 'mouseover' && !isAppMention(target)) {
        setHoveredMention(target)
      } else {
        setHoveredMention(null)
      }
    }

    container.addEventListener('click', clickListener)
    container.addEventListener('mouseover', hoverListener)
    container.addEventListener('mouseout', hoverListener)

    return () => {
      container.removeEventListener('click', clickListener)
      container.removeEventListener('mouseover', hoverListener)
      container.removeEventListener('mouseout', hoverListener)
    }
  }, [ref, scope])

  return hoveredMention
}
