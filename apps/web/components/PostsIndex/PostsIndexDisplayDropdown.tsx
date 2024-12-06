import { useState } from 'react'
import deepEqual from 'fast-deep-equal'
import { useAtom, useAtomValue } from 'jotai'

import { CurrentUser, Project } from '@campsite/types/generated'
import { Button } from '@campsite/ui/Button'
import { LayeredHotkeys } from '@campsite/ui/DismissibleLayer'
import { DropdownMenu } from '@campsite/ui/DropdownMenu'
import {
  ChatBubbleIcon,
  CheckIcon,
  FaceSmileIcon,
  FeedIcon,
  ListIcon,
  PhotoIcon,
  ResolvePostIcon,
  SlidersIcon,
  SwitchIcon
} from '@campsite/ui/Icons'
import { buildMenuItems } from '@campsite/ui/Menu'

import { useScope } from '@/contexts/scope'
import { useCurrentUserOrOrganizationHasFeature } from '@/hooks/useCurrentUserOrOrganizationHasFeature'
import { useDeleteProjectViewerDisplayPreference } from '@/hooks/useDeleteProjectViewerDisplayPreference'
import { useGetCurrentUser } from '@/hooks/useGetCurrentUser'
import { filterAtom, sortAtom } from '@/hooks/useGetPostsIndex'
import { usePostsDisplayPreference } from '@/hooks/usePostsDisplayPreference'
import { useUpdatePreference } from '@/hooks/useUpdatePreference'
import { useUpdateProjectDisplayPreference } from '@/hooks/useUpdateProjectDisplayPreference'
import { useUpdateProjectViewerDisplayPreference } from '@/hooks/useUpdateProjectViewerDisplayPreference'

interface Props {
  iconOnly?: boolean
  align?: 'start' | 'end' | 'center'
  project?: Project
}

export function PostsIndexDisplayDropdown({ iconOnly = false, align = 'end', project }: Props) {
  const [dropdownIsOpen, setDropdownIsOpen] = useState(false)
  const { scope } = useScope()
  const filter = useAtomValue(filterAtom({ scope }))
  const updatePreference = useUpdatePreference()
  const updateProjectViewerDisplayPreference = useUpdateProjectViewerDisplayPreference()
  const displayPreference = usePostsDisplayPreference()
  const [sort, setSort] = useAtom(sortAtom({ scope, filter }))
  const shortcut = 'shift+v'
  const hasComfyCompactLayout = useCurrentUserOrOrganizationHasFeature('comfy_compact_layout')
  const { data: currentUser } = useGetCurrentUser()
  const displayPreferencesAreDifferent =
    !!project?.viewer_display_preferences &&
    !deepEqual(project?.display_preferences, project?.viewer_display_preferences)
  const displayPreferences = project?.viewer_display_preferences ||
    project?.display_preferences || {
      display_attachments: true,
      display_comments: true,
      display_reactions: true,
      display_resolved: true
    }
  const updateProjectDisplayPreference = useUpdateProjectDisplayPreference()
  const deleteProjectViewerDisplayPreference = useDeleteProjectViewerDisplayPreference()

  function invertHomeDisplayPreference(key: keyof CurrentUser['preferences']) {
    if (!currentUser) return
    updatePreference.mutate({
      preference: key,
      value: currentUser.preferences[key] !== 'false' ? 'false' : 'true'
    })
  }

  function invertProjectDisplayPreference(key: keyof Project['display_preferences']) {
    if (!project) return

    const base_preference = { ...(project.viewer_display_preferences || project.display_preferences) }

    base_preference[key] = !base_preference[key]

    updateProjectViewerDisplayPreference.mutate({
      projectId: project.id,
      orgSlug: `${scope}`,
      ...base_preference
    })
  }

  const displayItems =
    hasComfyCompactLayout && project
      ? buildMenuItems([
          {
            type: 'heading',
            label: 'Display'
          },
          {
            type: 'item',
            leftSlot: <FaceSmileIcon />,
            rightSlot: displayPreferences.display_reactions ? <CheckIcon /> : null,
            label: 'Reactions',
            onSelect: (e) => {
              e.preventDefault()
              invertProjectDisplayPreference('display_reactions')
            }
          },
          {
            type: 'item',
            leftSlot: <PhotoIcon />,
            rightSlot: displayPreferences.display_attachments ? <CheckIcon /> : null,
            label: 'Attachments',
            onSelect: (e) => {
              e.preventDefault()
              invertProjectDisplayPreference('display_attachments')
            }
          },
          {
            type: 'item',
            leftSlot: <ChatBubbleIcon />,
            rightSlot: displayPreferences.display_comments ? <CheckIcon /> : null,
            label: 'Comments',
            onSelect: (e) => {
              e.preventDefault()
              invertProjectDisplayPreference('display_comments')
            }
          },
          {
            type: 'item',
            leftSlot: <ResolvePostIcon />,
            rightSlot: displayPreferences.display_resolved ? <CheckIcon /> : null,
            label: 'Resolved',
            onSelect: (e) => {
              e.preventDefault()
              invertProjectDisplayPreference('display_resolved')
            }
          },
          displayPreferencesAreDifferent && {
            type: 'item',
            label: 'Set as defaults',
            onSelect: () =>
              updateProjectDisplayPreference.mutate({
                projectId: project.id,
                orgSlug: `${scope}`,
                ...displayPreferences
              })
          },
          displayPreferencesAreDifferent && {
            type: 'item',
            label: 'Reset',
            onSelect: () =>
              deleteProjectViewerDisplayPreference.mutate({
                projectId: project.id,
                orgSlug: `${scope}`
              })
          },
          { type: 'separator' }
        ])
      : hasComfyCompactLayout
        ? buildMenuItems([
            {
              type: 'heading',
              label: 'Display'
            },
            {
              type: 'item',
              leftSlot: <FaceSmileIcon />,
              rightSlot: currentUser?.preferences.home_display_reactions !== 'false' ? <CheckIcon /> : null,
              label: 'Reactions',
              onSelect: (e) => {
                e.preventDefault()
                invertHomeDisplayPreference('home_display_reactions')
              }
            },
            {
              type: 'item',
              leftSlot: <PhotoIcon />,
              rightSlot: currentUser?.preferences.home_display_attachments !== 'false' ? <CheckIcon /> : null,
              label: 'Attachments',
              onSelect: (e) => {
                e.preventDefault()
                invertHomeDisplayPreference('home_display_attachments')
              }
            },
            {
              type: 'item',
              leftSlot: <ChatBubbleIcon />,
              rightSlot: currentUser?.preferences.home_display_comments !== 'false' ? <CheckIcon /> : null,
              label: 'Comments',
              onSelect: (e) => {
                e.preventDefault()
                invertHomeDisplayPreference('home_display_comments')
              }
            },
            {
              type: 'item',
              leftSlot: <ResolvePostIcon />,
              rightSlot: currentUser?.preferences.home_display_resolved !== 'false' ? <CheckIcon /> : null,
              label: 'Resolved',
              onSelect: (e) => {
                e.preventDefault()
                invertHomeDisplayPreference('home_display_resolved')
              }
            },
            { type: 'separator' }
          ])
        : buildMenuItems([
            {
              type: 'heading',
              label: 'Display density'
            },
            {
              type: 'item',
              leftSlot: <ListIcon />,
              rightSlot: displayPreference === 'compact' ? <CheckIcon /> : null,
              label: 'Compact',
              onSelect: () => updatePreference.mutate({ preference: 'posts_density', value: 'compact' })
            },
            {
              type: 'item',
              leftSlot: <FeedIcon />,
              rightSlot: displayPreference === 'comfortable' ? <CheckIcon /> : null,
              label: 'Comfortable',
              onSelect: () => updatePreference.mutate({ preference: 'posts_density', value: 'comfortable' })
            },
            { type: 'separator' }
          ])

  const items = buildMenuItems([
    ...displayItems,
    {
      type: 'heading',
      label: 'Ordering'
    },
    {
      type: 'item',
      rightSlot: sort === 'last_activity_at' ? <CheckIcon /> : null,
      label: 'Recent activity',
      onSelect: () => setSort('last_activity_at')
    },
    {
      type: 'item',
      rightSlot: sort === 'published_at' ? <CheckIcon /> : null,
      label: 'Created',
      onSelect: () => setSort('published_at')
    }
  ])

  return (
    <>
      <LayeredHotkeys keys={shortcut} callback={() => setDropdownIsOpen(true)} />

      <DropdownMenu
        open={dropdownIsOpen}
        onOpenChange={setDropdownIsOpen}
        items={items}
        align={align}
        trigger={
          <Button
            variant='plain'
            iconOnly={iconOnly ? <SwitchIcon /> : <SlidersIcon />}
            accessibilityLabel='Display dropdown'
            size='base'
            tooltip='Display and sort'
            tooltipShortcut={shortcut}
          />
        }
      />
    </>
  )
}
