/* eslint-disable max-lines */
import { createContext, memo, PropsWithChildren, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, LayoutGroup, m } from 'framer-motion'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import Router from 'next/router'
import { isMacOs } from 'react-device-detect'
import { flushSync } from 'react-dom'
import { useDebouncedCallback } from 'use-debounce'

import type { FollowUp, Notification, NotificationTarget } from '@campsite/types'
import {
  AlarmIcon,
  InboxIcon,
  LayeredHotkeys,
  Link,
  UIText,
  useBreakpoint,
  useCallbackRef,
  useIsDesktopApp
} from '@campsite/ui'
import { cn, ConditionalWrap } from '@campsite/ui/src/utils'

import { useTrackActivityView } from '@/components/Activity/Activity'
import { CallView } from '@/components/CallView'
import { HomeFollowUpDialog } from '@/components/Home/HomeFollowUpDialog'
import { FollowUpListItem } from '@/components/InboxItems/FollowUpListItem'
import { useInboxFilterHrefs } from '@/components/InboxItems/hooks/useInboxFilterHrefs'
import { useInboxDetailItemId, useInboxSelectedItemId } from '@/components/InboxItems/hooks/useInboxSelectedItemId'
import { InboxFilterButtons } from '@/components/InboxItems/InboxHoverCard'
import { InboxNotificationItem } from '@/components/InboxItems/InboxNotificationItem'
import { InboxProjectRenderer } from '@/components/InboxItems/InboxProjectRenderer'
import { InboxViewOptions } from '@/components/InboxItems/InboxViewOptions'
import { NotificationListItem } from '@/components/InboxItems/NotificationListItem'
import { NotificationOverflowMenu } from '@/components/InboxItems/NotificationOverflowMenu'
import {
  expandedNotificationGroupsAtom,
  getGroupedNotificationsByInboxKey,
  isNotification,
  isNotificationGroupExpandedAtom,
  setExpandedNotificationGroupAtom
} from '@/components/InboxItems/utils'
import { IndexPageEmptyState, IndexPageLoading } from '@/components/IndexPages/components'
import { InfiniteLoader } from '@/components/InfiniteLoader'
import { RefetchingPageIndicator } from '@/components/NavigationBar/RefetchingPageIndicator'
import { refetchingInboxAtom } from '@/components/NavigationBar/useNavigationTabAction'
import { NoteView } from '@/components/NoteView'
import { PostView } from '@/components/Post/PostView'
import { ScrollableContainer } from '@/components/ScrollableContainer'
import { BreadcrumbTitlebar, BreadcrumbTitlebarContainer } from '@/components/Titlebar/BreadcrumbTitlebar'
import { useCanHover } from '@/hooks/useCanHover'
import { useCurrentUserOrOrganizationHasFeature } from '@/hooks/useCurrentUserOrOrganizationHasFeature'
import { useDeleteFollowUp } from '@/hooks/useDeleteFollowUp'
import { useDeleteNotification } from '@/hooks/useDeleteNotification'
import { useExecuteOnChange } from '@/hooks/useExecuteOnChange'
import { useGetArchivedNotifications } from '@/hooks/useGetArchivedNotifications'
import { useGetFollowUps } from '@/hooks/useGetFollowUps'
import { useGetNotifications } from '@/hooks/useGetNotifications'
import { useMarkNotificationRead } from '@/hooks/useMarkNotificationRead'
import { useMarkNotificationUnread } from '@/hooks/useMarkNotificationUnread'
import { useScopedStorage } from '@/hooks/useScopedStorage'
import { useUnarchiveNotification } from '@/hooks/useUnarchiveNotification'
import { flattenInfiniteData } from '@/utils/flattenInfiniteData'
import { getGroupDateHeading } from '@/utils/getGroupDateHeading'
import { getInboxItemRoutePath } from '@/utils/getInboxItemRoutePath'
import { groupByDate } from '@/utils/groupByDate'

import { sidebarCollapsedAtom } from '../Layout/AppLayout'

export type InboxView = 'updates' | 'archived' | 'later' | 'activity'

export const defaultInboxView: InboxView = 'updates'

type InboxDetailItem = { type: 'notification'; item: Notification } | { type: 'followUp'; item: FollowUp }

interface InboxSplitViewContextType {
  detailItem: InboxDetailItem | undefined
  selectedItemInboxKey: string | undefined
  selectedItemInboxId: string | undefined
  triggerFollowUp: (item: Notification) => void
  triggerDelete: (item: Notification | FollowUp) => void
  toggleRead: (item: Notification) => void
  showDetailItem: (item: Notification | FollowUp) => void
}

const InboxSplitViewContext = createContext<InboxSplitViewContextType | null>(null)

export const useInboxSplitView = () => useContext(InboxSplitViewContext)

interface InboxSplitViewProps {
  view: InboxView
}

export function InboxSplitView({ view }: InboxSplitViewProps) {
  const isDesktopApp = useIsDesktopApp()
  const sidebarCollapsed = useAtomValue(sidebarCollapsedAtom)
  const expandedNotificationGroups = useAtomValue(expandedNotificationGroupsAtom)
  const setExpandedNotificationGroup = useSetAtom(setExpandedNotificationGroupAtom)
  const macTrafficLightsPresent = isDesktopApp && sidebarCollapsed && isMacOs
  const hasGroupedNotifications = useCurrentUserOrOrganizationHasFeature('grouped_notifications')
  const getNotifications = useGetNotifications({
    filter: hasGroupedNotifications ? 'grouped_home' : 'home',
    enabled: view === 'updates'
  })
  const getFollowUps = useGetFollowUps({ enabled: view === 'later' })
  const notifications = useMemo(() => flattenInfiniteData(getNotifications.data) || [], [getNotifications.data])
  const groupedNotificationsByInboxKey = useMemo(
    () => getGroupedNotificationsByInboxKey(notifications),
    [notifications]
  )
  const visibleNotifications = useMemo(
    () =>
      Object.entries(groupedNotificationsByInboxKey).flatMap(([inboxKey, group]) => {
        const isExpanded = expandedNotificationGroups[inboxKey] ?? false

        if (hasGroupedNotifications && isExpanded) return group

        const firstItem = group.at(0)

        if (!firstItem) return []
        return [firstItem]
      }),
    [groupedNotificationsByInboxKey, expandedNotificationGroups, hasGroupedNotifications]
  )
  const getArchivedNotifications = useGetArchivedNotifications({ enabled: view === 'archived' })
  const archivedNotifications = useMemo(
    () => flattenInfiniteData(getArchivedNotifications.data) || [],
    [getArchivedNotifications.data]
  )
  const getActivity = useGetNotifications({ enabled: view === 'activity', filter: 'activity' })
  const activity = useMemo(() => flattenInfiniteData(getActivity.data) || [], [getActivity.data])
  const followUps = useMemo(() => flattenInfiniteData(getFollowUps.data) || [], [getFollowUps.data])
  const getItems =
    view === 'updates'
      ? getNotifications
      : view === 'archived'
        ? getArchivedNotifications
        : view === 'activity'
          ? getActivity
          : getFollowUps
  const items =
    view === 'updates'
      ? visibleNotifications
      : view === 'archived'
        ? archivedNotifications
        : view === 'activity'
          ? activity
          : followUps
  const noItems = items.length === 0

  const { mutate: markNotificationRead } = useMarkNotificationRead()
  const { mutate: markNotificationUnread } = useMarkNotificationUnread()
  const { mutate: deleteNotification } = useDeleteNotification()
  const { mutate: unarchiveNotification } = useUnarchiveNotification()
  const { mutate: deleteFollowUp } = useDeleteFollowUp()
  const [lastSelectedItemInboxKey, setLastSelectedItemInboxKey] = useScopedStorage<string | undefined>(
    'lastSelectedItemInboxKey',
    undefined
  )

  // the item selected in the list
  const [selectedItemInboxKey, setSelectedItemInboxKey] = useState<string | undefined>(lastSelectedItemInboxKey)
  const { selectedItemInboxId, setSelectedItemInboxId } = useInboxSelectedItemId()

  // the item selected in the detail view is separated as we debounce from selection
  const [detailItemInboxKey, setDetailItemInboxKey] = useState<string | undefined>(lastSelectedItemInboxKey)
  const { detailItemInboxId, setDetailItemInboxId } = useInboxDetailItemId()

  useEffect(() => {
    if (Router.query.inboxItemKey) {
      setSelectedItemInboxKey(Router.query.inboxItemKey as string)
      setDetailItemInboxKey(Router.query.inboxItemKey as string)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Router.query.inboxItemKey])

  const detailItem: InboxDetailItem | undefined = useMemo(() => {
    const item = items?.find(function (n) {
      if (hasGroupedNotifications) return n.id === detailItemInboxId
      return n.inbox_key === detailItemInboxKey
    })

    if (!item) return undefined

    if (isNotification(item)) {
      return { type: 'notification' as const, item }
    } else {
      return { type: 'followUp' as const, item }
    }
  }, [items, hasGroupedNotifications, detailItemInboxId, detailItemInboxKey])

  const [followUpItem, setFollowUpItem] = useState<Notification | FollowUp | undefined>(undefined)

  // close the follow up dialog when the selected item changes
  // this shouldn't really happen in practice but if a notification has no follow up and the user presses f,
  // the follow up dialog will open when the selection changes
  const closeFollowUpDialog = () => setFollowUpItem(undefined)

  // reset selected items when changing views
  const viewRef = useRef(view)

  if (viewRef.current !== view) {
    viewRef.current = view
    closeFollowUpDialog()
    setSelectedItemInboxKey(undefined)
    setSelectedItemInboxId(undefined)
    setDetailItemInboxKey(undefined)
  }

  const getSelectedItem = () => {
    return items.find((n) => {
      if (hasGroupedNotifications) return n.id === selectedItemInboxId
      return n.inbox_key === selectedItemInboxKey
    })
  }

  const getSelectedItemIndex = () => {
    return items.findIndex((n) => {
      if (hasGroupedNotifications) return n.id === selectedItemInboxId
      return n.inbox_key === selectedItemInboxKey
    })
  }

  const toggleReadItem = useCallbackRef((item: Notification) => {
    if (item.read) {
      markNotificationUnread(item.id)
    } else {
      markNotificationRead(item.id)
    }
  })

  const next = useCallbackRef(() => {
    const index = getSelectedItemIndex()

    if (index < 0) return

    // if deleteing the last item, navigate to the previous one
    const nextIndex = index + 1 === items.length ? index - 1 : index + 1

    select(nextIndex, false)
  })

  // fire a delete mutation and then navigate to the next item
  const handleDeleteItem = useCallbackRef((item: Notification | FollowUp) => {
    if (isNotification(item)) {
      if (item.archived) {
        unarchiveNotification(item.id)
      } else {
        const isNotificationGroupExpanded = expandedNotificationGroups[item.inbox_key]
        const isNotificationGroupParent = groupedNotificationsByInboxKey[item.inbox_key].at(0)?.id === item.id
        const archiveBy = isNotificationGroupExpanded && !isNotificationGroupParent ? 'id' : 'target'

        deleteNotification({ notification: item, archiveBy })
      }
    } else {
      deleteFollowUp(item)
    }

    // if the item we're deleting isn't the currently selected item, do nothing
    if (hasGroupedNotifications && selectedItemInboxId !== item.id) return
    if (!hasGroupedNotifications && selectedItemInboxKey !== item.inbox_key) return

    next()
  })

  const setDetailItemInboxKeyAndMaskRouter = useCallbackRef((item: Notification | FollowUp) => {
    setDetailItemInboxKey(item.inbox_key)
    setDetailItemInboxId(item.id)

    const { pathname, query } = Router

    // save the inbox key to local storage so that navigating back to the inbox page will load the correct item
    setLastSelectedItemInboxKey(item.inbox_key)

    // mask the inbox path+query with the actual resource
    // do a shallow replace since we're just changing the query params
    Router.replace({ pathname, query }, getInboxItemRoutePath(item), { shallow: true })

    if (isNotification(item)) {
      markNotificationRead(item.id)
    }
  })
  const debouncedSetActiveItemInboxKeyAndMaskRouter = useDebouncedCallback(setDetailItemInboxKeyAndMaskRouter, 200)

  const select = (index: number, debounce: boolean = true) => {
    if (
      // noop if empty list or out of bounds
      noItems ||
      index < 0 ||
      index >= items.length ||
      // noop if the item is the same as the current one
      (hasGroupedNotifications && items[index].id === selectedItemInboxId) ||
      (!hasGroupedNotifications && items[index].inbox_key === selectedItemInboxKey)
    ) {
      return
    }

    // immediately update the selected list item
    setSelectedItemInboxKey(items[index].inbox_key)
    setSelectedItemInboxId(items[index].id)
    closeFollowUpDialog()

    const item = items[index]
    const setter = debounce ? debouncedSetActiveItemInboxKeyAndMaskRouter : setDetailItemInboxKeyAndMaskRouter

    // debounced update the active item
    setter(item)

    document.getElementById(inboxItemId(item))?.scrollIntoView({ block: 'nearest' })
  }

  const handleNavigate = (e: KeyboardEvent, dir: 1 | -1) => {
    if (noItems) return

    e.preventDefault()

    // if no selection, go to the first notification
    if (hasGroupedNotifications && !selectedItemInboxId) return select(0)
    if (!hasGroupedNotifications && !selectedItemInboxKey) return select(0)

    const index = getSelectedItemIndex()

    if (index < 0) return select(0)
    return select(index + dir)
  }

  const handleExpandNotificationGroup = (e: KeyboardEvent, expanded: boolean) => {
    if (!hasGroupedNotifications) return
    if (noItems) return

    const item = getSelectedItem()

    if (!item) return

    e.preventDefault()

    /**
     * When a group is collapsed, select the first item in the group to maintain the current selection
     */
    if (!expanded) {
      const itemGroup = groupedNotificationsByInboxKey[item.inbox_key]
      const firstItem = itemGroup.at(0)
      const index = items.findIndex((n) => n.id === firstItem?.id)

      select(index, false)
    }

    setExpandedNotificationGroup({ inboxKey: item.inbox_key, expanded })
  }

  const handleFollowUp = () => {
    const selectedItem = getSelectedItem()

    if (!selectedItem) return
    setFollowUpItem(selectedItem)
  }

  const handleDelete = () => {
    const selectedItem = getSelectedItem()

    if (!selectedItem) return
    handleDeleteItem(selectedItem)
  }

  const toggleUnread = () => {
    const selectedItem = getSelectedItem()

    if (!selectedItem || !isNotification(selectedItem)) return
    toggleReadItem(selectedItem)
  }

  const isRefetching = useAtomValue(refetchingInboxAtom)
  const { updatesHref, archivedHref, laterHref } = useInboxFilterHrefs()

  // ref callback to minimize rerenders for context consumers
  const showDetailItem = useCallbackRef((item: Notification | FollowUp) => {
    setSelectedItemInboxKey(item.inbox_key)
    setSelectedItemInboxId(item.id)
    closeFollowUpDialog()
    setDetailItemInboxKeyAndMaskRouter(item)
  })

  const context = useMemo(
    () => ({
      detailItem,
      selectedItemInboxKey,
      selectedItemInboxId,
      triggerFollowUp: (n: Notification) => setFollowUpItem(n),
      triggerDelete: handleDeleteItem,
      toggleRead: toggleReadItem,
      showDetailItem
    }),
    [detailItem, selectedItemInboxKey, selectedItemInboxId, handleDeleteItem, toggleReadItem, showDetailItem]
  )

  /**
   * If the user inbox selection is a `plain` notification and there's an incoming notification with the same `inboxKey`,
   * this will result in the creation of a notification group. Since the current selection could become a `group-child`,
   * we need to make sure the group gets expanded as the new notification arrives in the inbox.
   */
  useEffect(() => {
    if (detailItem || !detailItemInboxKey || !hasGroupedNotifications) return

    const isNotificationGroupUncontrolled = expandedNotificationGroups[detailItemInboxKey] === undefined
    const item = notifications.find((n) => n.inbox_key === detailItemInboxKey)

    if (isNotificationGroupUncontrolled && item) {
      // flush update as a state batching mechanism and avoid ui flicker when the group is not expanded
      flushSync(() => setExpandedNotificationGroup({ inboxKey: detailItemInboxKey, expanded: true }))
    }
  }, [
    detailItem,
    detailItemInboxKey,
    expandedNotificationGroups,
    hasGroupedNotifications,
    notifications,
    setExpandedNotificationGroup
  ])

  return (
    <>
      <LayeredHotkeys keys={['1']} callback={() => Router.push(updatesHref)} />
      <LayeredHotkeys keys={['2']} callback={() => Router.push(archivedHref)} />
      <LayeredHotkeys keys={['3']} callback={() => Router.push(laterHref)} />
      <LayeredHotkeys keys={['j', 'ArrowDown']} callback={(e) => handleNavigate(e, 1)} options={{ repeat: true }} />
      <LayeredHotkeys keys={['k', 'ArrowUp']} callback={(e) => handleNavigate(e, -1)} options={{ repeat: true }} />
      <LayeredHotkeys keys={['h', 'ArrowLeft']} callback={(e) => handleExpandNotificationGroup(e, false)} />
      <LayeredHotkeys keys={['l', 'ArrowRight']} callback={(e) => handleExpandNotificationGroup(e, true)} />
      <LayeredHotkeys keys={['mod+ArrowDown']} callback={() => select(items.length - 1)} />
      <LayeredHotkeys keys={['mod+ArrowUp']} callback={() => select(0)} />
      <LayeredHotkeys keys={['f']} callback={handleFollowUp} />
      <LayeredHotkeys keys={['e', 'backspace', 'delete']} callback={handleDelete} />
      <LayeredHotkeys
        keys={['u']}
        callback={toggleUnread}
        options={{ enabled: hasGroupedNotifications ? !!selectedItemInboxId : !!selectedItemInboxKey }}
      />

      {followUpItem && isNotification(followUpItem) && followUpItem.follow_up_subject && (
        <HomeFollowUpDialog
          title={followUpItem.summary}
          id={followUpItem.follow_up_subject.id}
          type={followUpItem.follow_up_subject.type}
          viewerFollowUp={followUpItem.follow_up_subject.viewer_follow_up}
          // creating the follow up will delete the notification, so advance to the next item
          onBeforeCreate={() => {
            if (!followUpItem.archived) next()
          }}
          onOpenChange={(open) => {
            if (!open) {
              setFollowUpItem(undefined)
            }
          }}
          open
        />
      )}

      <InboxSplitViewContext.Provider value={context}>
        <div className='flex flex-1 overflow-hidden'>
          <div
            className={cn('w-full flex-col overflow-hidden lg:max-w-[600px] lg:basis-[30%] lg:border-r', {
              'hidden lg:flex': detailItem,
              flex: !detailItem,
              'lg:min-w-[350px]': !macTrafficLightsPresent,
              'lg:min-w-[450px]': macTrafficLightsPresent
            })}
          >
            <div className='flex h-full flex-1 flex-col overflow-hidden'>
              <BreadcrumbTitlebar>
                <span className='flex flex-1 items-center gap-3'>
                  <InboxViewOptions
                    view={view}
                    rightSlot={
                      // only show bulk action buttons on the updates view
                      view === 'updates' && <InboxFilterButtons notifications={notifications} />
                    }
                  />
                </span>
              </BreadcrumbTitlebar>

              {/* Used for collapsed views */}
              <BreadcrumbTitlebar className='flex h-auto py-1.5 lg:hidden'>
                <InboxViewOptions view={view} showActivity />
              </BreadcrumbTitlebar>

              <RefetchingPageIndicator isRefetching={isRefetching} />

              <ScrollableContainer disableStableGutter>
                {getItems.isLoading ? (
                  <IndexPageLoading />
                ) : noItems ? (
                  <InboxIndexEmptyState inboxView={view} />
                ) : view === 'updates' ? (
                  <InboxNotifications notifications={notifications} />
                ) : view === 'archived' ? (
                  <UngroupedInboxNotifications notifications={archivedNotifications} />
                ) : view === 'later' ? (
                  <InboxFollowUps followUps={followUps} />
                ) : view === 'activity' ? (
                  <InboxActivity notifications={activity} />
                ) : null}

                <InfiniteLoader
                  hasNextPage={!!getItems.hasNextPage}
                  isError={!!getItems.isError}
                  isFetching={!!getItems.isFetching}
                  isFetchingNextPage={!!getItems.isFetchingNextPage}
                  fetchNextPage={getItems.fetchNextPage}
                />
              </ScrollableContainer>
            </div>
          </div>

          <div
            className={cn('flex min-w-0 flex-1 flex-col', {
              'hidden lg:flex': !detailItem,
              flex: detailItem
            })}
          >
            {detailItem && <Detail key={detailItem.item.inbox_key} target={detailItem.item.target} />}
          </div>
        </div>
      </InboxSplitViewContext.Provider>
    </>
  )
}

function InboxGroup({ date, children }: PropsWithChildren & { date: string }) {
  return (
    <div key={date} className='flex flex-col'>
      <div className='bg-primary sticky top-0 z-10 flex h-10 items-center border-b px-3'>
        <UIText weight='font-medium' tertiary>
          {getGroupDateHeading(date)}
        </UIText>
      </div>

      <ul className='flex flex-col gap-px p-2'>
        <LayoutGroup>
          <AnimatePresence initial={false}>{children}</AnimatePresence>
        </LayoutGroup>
      </ul>
    </div>
  )
}

function InboxNotifications({ notifications }: { notifications: Notification[] }) {
  const groups = useMemo(() => {
    const inboxKeyGroups = getGroupedNotificationsByInboxKey(notifications)

    return groupByDate(Object.values(inboxKeyGroups), (group) => group[0].created_at)
  }, [notifications])

  return Object.entries(groups).map(([date, items]) => {
    return (
      <InboxGroup key={date} date={date}>
        <AnimatePresence initial={false}>
          {items.map((item) => (
            <InboxNotificationItemGroup key={item[0].inbox_key} notifications={item} />
          ))}
        </AnimatePresence>
      </InboxGroup>
    )
  })
}

function UngroupedInboxNotifications({ notifications }: { notifications: Notification[] }) {
  return (
    <ul className='flex flex-col gap-px p-2'>
      {notifications.map((notification) => (
        <m.li
          key={notification.inbox_key}
          initial={{ opacity: 0, height: 0, y: -4 }}
          animate={{ opacity: 1, height: 'auto', y: 0 }}
          exit={{ opacity: 0, height: 0, y: -4 }}
          transition={{ duration: 0.15 }}
        >
          <InboxItem item={notification}>
            <InboxNotificationItem notification={notification} />
          </InboxItem>
        </m.li>
      ))}
    </ul>
  )
}

interface InboxNotificationItemGroupProps {
  notifications: Notification[]
}

function InboxNotificationItemGroup({ notifications }: InboxNotificationItemGroupProps) {
  const [isExpanded, setIsExpanded] = useAtom(
    // eslint-disable-next-line react-hooks/exhaustive-deps -- memoize atom selector for reference equality
    useMemo(() => isNotificationGroupExpandedAtom(notifications[0].inbox_key), [notifications[0].inbox_key])
  )

  return (
    <m.div
      className='flex flex-col'
      initial={{ opacity: 0, height: 0, y: -4 }}
      animate={{ opacity: 1, height: 'auto', y: 0 }}
      exit={{ opacity: 0, height: 0, y: -4 }}
      transition={{ duration: 0.15 }}
    >
      <AnimatePresence initial={false}>
        {notifications.map((item, index) => {
          const variant = (() => {
            if (index === 0 && notifications.length > 1) return 'group-parent'
            if (index > 0 && notifications.length > 1) return 'group-child'
            return 'plain'
          })()
          const shouldHide = variant === 'group-child' && !isExpanded

          if (shouldHide) return null
          return (
            <m.li
              key={item.id}
              initial={{ opacity: 0, height: 0, y: -4 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -4 }}
              transition={{ duration: 0.15 }}
            >
              <InboxItem
                item={item}
                variant={variant}
                isGroupExpanded={isExpanded}
                className={cn(
                  'transition-all duration-150',
                  variant === 'group-parent' && isExpanded && 'rounded-b-none',
                  variant === 'group-child' && index === notifications.length - 1 && 'rounded-t-none',
                  variant === 'group-child' && index > 0 && index < notifications.length - 1 && 'rounded-none'
                )}
              >
                <InboxNotificationItem
                  notification={item}
                  variant={variant}
                  groupSize={notifications.length}
                  isGroupExpanded={isExpanded}
                  toggleGroup={() => setIsExpanded(!isExpanded)}
                />
              </InboxItem>
            </m.li>
          )
        })}
      </AnimatePresence>
    </m.div>
  )
}

function InboxFollowUps({ followUps }: { followUps: FollowUp[] }) {
  const groups = useMemo(() => groupByDate(followUps, (fu) => fu.show_at, 'asc'), [followUps])

  return Object.entries(groups).map(([date, items]) => {
    return (
      <InboxGroup key={date} date={date}>
        {items.map((item) => (
          <m.li
            key={item.inbox_key}
            initial={{ opacity: 0, height: 0, y: -4 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -4 }}
            transition={{ duration: 0.15 }}
          >
            <InboxItem key={item.inbox_key} item={item}>
              <FollowUpListItem followUp={item} />
            </InboxItem>
          </m.li>
        ))}
      </InboxGroup>
    )
  })
}

function InboxActivity({ notifications }: { notifications: Notification[] }) {
  const ref = useTrackActivityView()

  return (
    <ul ref={ref} className='flex flex-col gap-px p-2'>
      <AnimatePresence initial={false}>
        {notifications.map((item) => (
          <m.li
            key={item.inbox_key}
            initial={{ opacity: 0, height: 0, y: -4 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -4 }}
            transition={{ duration: 0.15 }}
          >
            <InboxItem item={item}>
              <NotificationListItem notification={item} display='activity' />
            </InboxItem>
          </m.li>
        ))}
      </AnimatePresence>
    </ul>
  )
}

function InboxIndexEmptyState({ inboxView }: { inboxView: InboxView }) {
  return (
    <IndexPageEmptyState>
      {inboxView === 'updates' ? (
        <InboxIcon className='text-gray-300 dark:text-gray-700' size={80} />
      ) : (
        <AlarmIcon className='text-gray-300 dark:text-gray-700' size={80} />
      )}
    </IndexPageEmptyState>
  )
}

const Detail = memo(function Detail({ target }: { target: NotificationTarget }) {
  switch (target.type) {
    case 'Post':
      return <PostView postId={target.id} />
    case 'Project':
      return <InboxProjectRenderer projectId={target.id} />
    case 'Note':
      return <NoteView noteId={target.id} />
    case 'Call':
      return <CallView callId={target.id} />
    default:
      return <p>Not found</p>
  }
})

function inboxItemId(item: Notification | FollowUp) {
  return `inbox-item-${item.inbox_key}`
}

interface InboxItemProps extends PropsWithChildren {
  item: Notification | FollowUp
  variant?: 'plain' | 'group-parent' | 'group-child'
  isGroupExpanded?: boolean
  className?: string
}

function InboxItem({ item, children, variant = 'plain', isGroupExpanded, className }: InboxItemProps) {
  const canHover = useCanHover()
  const inbox = useInboxSplitView()
  const showsSplitView = useBreakpoint('lg')
  const ref = useRef<HTMLDivElement>(null)
  const { mutate: markNotificationRead } = useMarkNotificationRead()
  const hasGroupedNotifications = useCurrentUserOrOrganizationHasFeature('grouped_notifications')
  const isActive = hasGroupedNotifications
    ? inbox?.selectedItemInboxId === item.id
    : inbox?.selectedItemInboxKey === item.inbox_key

  useExecuteOnChange(isActive, () => {
    if (isActive && ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  })

  return (
    <ConditionalWrap
      condition={canHover}
      wrap={(children) => (
        <NotificationOverflowMenu item={item} type='context'>
          {children}
        </NotificationOverflowMenu>
      )}
    >
      <div
        ref={ref}
        className={cn(
          'dark:focus:bg-tertiary group relative flex min-h-12 flex-none cursor-pointer scroll-m-2 scroll-mt-12 items-center gap-3 rounded-lg p-2.5',
          'border-none outline-none ring-0 focus-within:border-none focus-within:outline-none focus-within:ring-0 focus:border-none focus:outline-none focus:ring-0',
          className,
          // plain
          variant === 'plain' && isActive && 'bg-tertiary hover:bg-quaternary',
          variant === 'plain' && !isActive && 'hover:bg-tertiary',
          // group-parent
          isActive && variant === 'group-parent' && 'bg-quaternary hover:bg-quaternary',
          !isActive && variant === 'group-parent' && 'hover:bg-tertiary',
          !isActive &&
            isGroupExpanded &&
            variant === 'group-parent' &&
            'hover:bg-quaternary bg-black/[0.025] dark:bg-white/[0.045]',
          // group-child
          variant === 'group-child' && isActive && 'bg-quaternary hover:bg-quaternary',
          variant === 'group-child' && !isActive && 'hover:bg-quaternary bg-black/[0.025] dark:bg-white/[0.045]'
        )}
      >
        <Link
          className='absolute inset-0 focus:outline-none focus:ring-0'
          href={getInboxItemRoutePath(item)}
          onClick={(e) => {
            if (!e.metaKey && showsSplitView) {
              inbox?.showDetailItem(item)
              e.preventDefault()
            } else {
              // only mark as read when not showing the detail item, as that will also mark it as read
              markNotificationRead(item.id)
            }
          }}
        />

        {children}
      </div>
    </ConditionalWrap>
  )
}

export function InboxSplitViewTitleBar({
  children,
  hideSidebarToggle = false
}: PropsWithChildren & { hideSidebarToggle?: boolean }) {
  const isInboxSplitView = !!useInboxSplitView()

  if (isInboxSplitView) {
    return <BreadcrumbTitlebarContainer hideSidebarToggle>{children}</BreadcrumbTitlebarContainer>
  }

  return <BreadcrumbTitlebar hideSidebarToggle={hideSidebarToggle}>{children}</BreadcrumbTitlebar>
}
