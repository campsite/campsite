import { useCallback, useLayoutEffect, useMemo, useRef } from 'react'

import { useLayeredHotkeys } from '@campsite/ui/DismissibleLayer'
import { useCallbackRef } from '@campsite/ui/hooks'

type Item = { groupIndex: number; itemIndex: number }

export type SelectGroupItemFn = (args: { groupIndex: number; itemIndex: number; scroll?: boolean }) => void

export function useGroupedListNavigation<T extends { id: string }>({
  initialActiveItemId,
  groups,
  getItemDOMId
}: {
  initialActiveItemId?: string
  groups: Record<string, T[]>
  getItemDOMId: (item: T) => string
}) {
  const initialActiveItemIdRef = useRef(initialActiveItemId)
  const activeItemRef = useRef<Item | null>(null)
  const handleItemDOMId = useCallbackRef(getItemDOMId)

  const groupsRef = useRef(groups)

  groupsRef.current = groups

  // reset activeItemRef if the active post is no longer in the list
  if (activeItemRef.current) {
    if (activeItemRef.current.groupIndex >= Object.keys(groups).length) {
      activeItemRef.current = null
    } else if (
      activeItemRef.current.itemIndex >= groups[Object.keys(groups)[activeItemRef.current.groupIndex]].length
    ) {
      activeItemRef.current = null
    }
  }

  const { getItemElement, selectNextItem, selectPreviousItem, selectItem, resetActiveItem } = useMemo(() => {
    const focusActiveItem = ({ scroll }: { scroll?: boolean } = { scroll: true }) => {
      const element = getItemElement(activeItemRef.current)

      if (!element) return

      element.focus({ preventScroll: true })
      if (scroll) element.scrollIntoView({ block: 'nearest' })
    }

    return {
      getItemElement: (itemPosition: Item | null) => {
        if (!itemPosition) return

        const newGroupKey = Object.keys(groupsRef.current)[itemPosition.groupIndex]
        const item = groupsRef.current[newGroupKey]?.[itemPosition.itemIndex]

        if (!item) return

        const elementId = handleItemDOMId(item)

        if (!elementId) return

        return document.getElementById(elementId)
      },
      selectNextItem: () => {
        const groupKeys = Object.keys(groupsRef.current)

        if (!activeItemRef.current) {
          const firstNonEmptyGroupKey = groupKeys.findIndex((key) => groupsRef.current[key].length > 0)

          activeItemRef.current = {
            groupIndex: Math.max(0, firstNonEmptyGroupKey),
            itemIndex: 0
          }
        } else {
          const { groupIndex, itemIndex } = activeItemRef.current
          const currentGroupKey = groupKeys[groupIndex]

          if (itemIndex + 1 < groupsRef.current[currentGroupKey].length) {
            activeItemRef.current = { groupIndex, itemIndex: itemIndex + 1 }
          } else if (groupIndex + 1 < groupKeys.length) {
            activeItemRef.current = { groupIndex: groupIndex + 1, itemIndex: 0 }
          }
        }

        focusActiveItem()
      },
      selectPreviousItem: () => {
        if (!activeItemRef.current) {
          activeItemRef.current = { groupIndex: 0, itemIndex: 0 }
        } else {
          const { groupIndex, itemIndex } = activeItemRef.current
          const previousGroupKey = Object.keys(groupsRef.current)[groupIndex - 1]

          if (itemIndex > 0) {
            activeItemRef.current = { groupIndex, itemIndex: itemIndex - 1 }
          } else if (groupIndex > 0) {
            activeItemRef.current = {
              groupIndex: groupIndex - 1,
              itemIndex: groupsRef.current[previousGroupKey].length - 1
            }
          }
        }

        focusActiveItem()
      },
      selectItem: ({
        groupIndex,
        itemIndex,
        scroll = true
      }: {
        groupIndex: number
        itemIndex: number
        scroll?: boolean
      }) => {
        activeItemRef.current = { groupIndex, itemIndex }
        focusActiveItem({ scroll })
      },
      resetActiveItem: () => {
        activeItemRef.current = null
      }
    }
  }, [handleItemDOMId])

  useLayeredHotkeys({
    keys: ['j', 'ArrowDown'],
    options: { preventDefault: true, repeat: true },
    callback: selectNextItem
  })

  useLayeredHotkeys({
    keys: ['k', 'ArrowUp'],
    options: { preventDefault: true, repeat: true },
    callback: selectPreviousItem
  })

  /**
   * Set initial value for `activeItemRef` if we navigated back to the
   * list page from detail view. This needs to happen as part of an effect to ensure
   * the element is mounted to the DOM before focusing it.
   */
  useLayoutEffect(() => {
    if (!initialActiveItemIdRef.current) return

    const groupKeys = Object.keys(groupsRef.current)
    const groupIndex = groupKeys.findIndex((key) =>
      groupsRef.current[key].some((p) => p.id === initialActiveItemIdRef.current)
    )
    const postIndex =
      groupsRef.current[groupKeys[groupIndex]]?.findIndex((p) => p.id === initialActiveItemIdRef.current) ?? -1

    if (groupIndex === -1 || postIndex === -1) return

    selectItem({ groupIndex, itemIndex: postIndex, scroll: false })
  }, [selectItem])

  return { selectItem, resetActiveItem }
}

type SelectItemFn = (args: { itemIndex: number; scroll?: boolean }) => void

export function useListNavigation<T extends { id: string }>({
  initialActiveItemId,
  items,
  getItemDOMId
}: {
  initialActiveItemId?: string
  items: T[]
  getItemDOMId: (item: T) => string
}) {
  const { selectItem: selectGroupedItem, resetActiveItem } = useGroupedListNavigation({
    initialActiveItemId,
    groups: { items },
    getItemDOMId
  })

  const selectItem = useCallback<SelectItemFn>(
    ({ itemIndex, scroll }) => {
      selectGroupedItem({ groupIndex: 0, itemIndex, scroll })
    },
    [selectGroupedItem]
  )

  return { selectItem, resetActiveItem }
}
