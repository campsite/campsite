import { useMemo } from 'react'

import { SyncProject } from '@campsite/types/generated'
import { Checkbox } from '@campsite/ui/Checkbox'
import { HighlightedCommandItem } from '@campsite/ui/Command'
import { Command } from '@campsite/ui/Command/Command'
import { SearchIcon } from '@campsite/ui/Icons'
import { UIText } from '@campsite/ui/Text'

import { ProjectAccessory } from '@/components/Projects/ProjectAccessory'
import { useSyncedProjects } from '@/hooks/useSyncedProjects'

interface MemberProjectsManagementProps {
  query?: string
  setQuery?: (query: string) => void
  initialProjectIds?: Set<string>
  addedProjectIds: Set<string>
  onAddedProjectIdsChange: (addedProjectIds: Set<string>) => void
  removedProjectIds?: Set<string>
  onRemovedProjectIdsChange?: (removedProjectIds: Set<string>) => void
}

export function ProjectsManagement({
  query,
  setQuery,
  initialProjectIds,
  addedProjectIds,
  onAddedProjectIdsChange,
  removedProjectIds,
  onRemovedProjectIdsChange
}: MemberProjectsManagementProps) {
  const { projects } = useSyncedProjects()
  const selectedProjectIds = useMemo(
    () =>
      new Set([
        ...Array.from(addedProjectIds),
        ...Array.from(initialProjectIds || []).filter((id) => !removedProjectIds?.has(id))
      ]),
    [addedProjectIds, removedProjectIds, initialProjectIds]
  )

  function onSelectProject(project: SyncProject) {
    if (addedProjectIds.has(project.id)) {
      addedProjectIds.delete(project.id)

      return onAddedProjectIdsChange(new Set(addedProjectIds))
    }

    if (removedProjectIds?.has(project.id)) {
      if (!onRemovedProjectIdsChange) return

      removedProjectIds.delete(project.id)
      return onRemovedProjectIdsChange(new Set(removedProjectIds))
    }

    if (initialProjectIds?.has(project.id)) {
      if (!removedProjectIds || !onRemovedProjectIdsChange) return

      removedProjectIds.add(project.id)
      return onRemovedProjectIdsChange(new Set(removedProjectIds))
    }

    addedProjectIds.add(project.id)
    onAddedProjectIdsChange(new Set(addedProjectIds))
  }

  function onKeyDownCapture(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') {
      e.stopPropagation()
      e.currentTarget.blur()
    }
  }

  function initiallySelectedProjectsFirst(a: SyncProject, b: SyncProject) {
    if (!initialProjectIds) return 0

    if (initialProjectIds.has(a.id) && !initialProjectIds.has(b.id)) {
      return -1
    }

    if (!initialProjectIds.has(a.id) && initialProjectIds.has(b.id)) {
      return 1
    }

    return 0
  }

  return (
    <Command className='flex min-h-[30dvh] flex-1 flex-col overflow-hidden' loop>
      <div className='flex items-center gap-3 border-b px-3'>
        <div className='flex h-6 w-6 items-center justify-center'>
          <SearchIcon className='text-quaternary' />
        </div>
        <Command.Input
          autoFocus
          placeholder='Search channels...'
          value={query}
          onValueChange={setQuery}
          className='w-full border-0 bg-transparent py-3 pl-0 pr-4 text-[15px] placeholder-gray-400 outline-none focus:border-black focus:border-black/5 focus:ring-0'
          onKeyDownCapture={onKeyDownCapture}
        />
      </div>

      <Command.List className='scrollbar-hide overflow-y-auto'>
        <Command.Group className='p-3'>
          <Command.Empty className='flex h-full w-full flex-1 flex-col items-center justify-center gap-1 p-8 pt-12'>
            <UIText weight='font-medium' quaternary>
              No channels found
            </UIText>
          </Command.Empty>

          {projects?.sort(initiallySelectedProjectsFirst).map((project) => (
            <HighlightedCommandItem
              key={project.id}
              onClick={() => onSelectProject(project)}
              onSelect={() => onSelectProject(project)}
              className='h-10 gap-3 rounded-lg'
            >
              <ProjectAccessory project={project} />
              <span className='line-clamp-1 flex-1'>{project.name}</span>
              <Checkbox checked={selectedProjectIds.has(project.id)} />
            </HighlightedCommandItem>
          ))}
        </Command.Group>
      </Command.List>
    </Command>
  )
}
