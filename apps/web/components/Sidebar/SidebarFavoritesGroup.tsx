import { useRef, useState } from 'react'
import { Reorder } from 'framer-motion'
import { useRouter } from 'next/router'

import { ReorderDotsIcon, StarOutlineIcon } from '@campsite/ui/Icons'
import { UIText } from '@campsite/ui/Text'
import { cn, ConditionalWrap } from '@campsite/ui/utils'

import { SidebarCollapsibleButton } from '@/components/Sidebar/SidebarCollapsibleButton'
import { SidebarFavorite } from '@/components/Sidebar/SidebarFavorite'
import { SidebarGroup } from '@/components/Sidebar/SidebarGroup'
import { useGetFavorites } from '@/hooks/useGetFavorites'
import { useReorderFavorites } from '@/hooks/useReorderFavorites'
import { useScopedStorage } from '@/hooks/useScopedStorage'
import { isOptimisticFavorite } from '@/utils/optimisticFavorites'

export function SidebarFavoritesGroup() {
  const router = useRouter()
  const { data: favorites, isLoading } = useGetFavorites()
  const { onReorder, mutation: reorder } = useReorderFavorites()
  const hasFavorites = favorites && favorites.length > 0
  const hasOptimisticFavorite = favorites && favorites.some((favorite) => isOptimisticFavorite(favorite))

  const [collapsed, setCollapsed] = useScopedStorage('sidebar-favorites-collapsed', false)
  const [draggingId, setDraggingId] = useState<undefined | string>()
  const [hoveredId, setHoveredId] = useState<undefined | string>()
  const containerRef = useRef<HTMLDivElement>(null)

  if (isLoading) return null

  if (!hasFavorites) {
    return (
      <SidebarGroup>
        <SidebarCollapsibleButton collapsed={collapsed} setCollapsed={setCollapsed} label='Favorites' />
        {!collapsed && (
          <div className='text-quaternary flex items-center gap-2 p-2 pt-0.5'>
            <UIText size='text-xs' inherit>
              Favorite your most important chat threads and channels.
            </UIText>
            <StarOutlineIcon className='flex-none opacity-70' size={16} />
          </div>
        )}
      </SidebarGroup>
    )
  }

  const sortedIds = favorites.sort((a, b) => a.position - b.position).map((f) => f.id)

  const selectedThreadId = router.query.threadId as string
  const selectedSpaceId = router.query.projectId as string

  const unreadAndSelectedItems = favorites.filter((fav) => {
    if (fav.project) {
      return fav.project.unread_for_viewer || fav.project.id === selectedSpaceId
    } else if (fav.message_thread) {
      // check the focus prop — if the user navigates from chat -> thread, we don't need to show the currently selected thread in the collapsed faves
      const isViewingFocusedChatThread = fav.message_thread.id === selectedThreadId && !!router.query.focus
      const isHovering = fav.message_thread.id === hoveredId

      return (
        fav.message_thread.unread_count > 0 ||
        fav.message_thread.manually_marked_unread ||
        isViewingFocusedChatThread ||
        isHovering
      )
    }
    return false
  })

  const renderableItems = collapsed ? unreadAndSelectedItems : favorites

  return (
    <SidebarGroup className='group/favorites'>
      <div className='flex items-center gap-px'>
        <SidebarCollapsibleButton collapsed={collapsed} setCollapsed={setCollapsed} label='Favorites' />
      </div>

      <Reorder.Group
        ref={containerRef}
        axis='y'
        key={collapsed ? 'collapsed' : 'expanded'}
        values={sortedIds}
        onReorder={onReorder}
        className='flex flex-col gap-px'
        layoutScroll
      >
        {renderableItems.map((fav) => (
          <ConditionalWrap
            key={fav.id}
            condition={!hasOptimisticFavorite}
            wrap={(children) => (
              <Reorder.Item
                value={fav.id}
                id={fav.id}
                drag={!collapsed}
                layout='position'
                dragConstraints={containerRef}
                dragElastic={0.065}
                onDragStart={() => setDraggingId(fav.id)}
                onDragEnd={() => {
                  setDraggingId(undefined)
                  reorder.mutate(sortedIds)
                }}
                className={cn('group/reorder-item relative', {
                  'opacity-60': draggingId === fav.id,
                  'pointer-events-none': !!draggingId
                })}
              >
                {!collapsed && (
                  <span className='text-quaternary absolute -left-[11px] top-1/2 -translate-y-1/2 cursor-move opacity-0 group-hover/reorder-item:opacity-100 group-has-[[data-state="open"]]/reorder-item:opacity-100'>
                    <ReorderDotsIcon strokeWidth='2' size={16} />
                  </span>
                )}
                {children}
              </Reorder.Item>
            )}
          >
            <SidebarFavorite favorite={fav} isDragging={draggingId === fav.id} onPeek={setHoveredId} />
          </ConditionalWrap>
        ))}
      </Reorder.Group>
    </SidebarGroup>
  )
}
