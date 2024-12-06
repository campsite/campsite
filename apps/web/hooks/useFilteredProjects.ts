import { useMemo } from 'react'

import { SyncProject } from '@campsite/types/generated'

import { useSyncedProjects } from '@/hooks/useSyncedProjects'
import { commandScoreSort } from '@/utils/commandScoreSort'

interface Options {
  selectedProjectId: string | undefined
  query: string | undefined
  includeProjectId?: string
  excludeChatProjects?: boolean
}

export function useFilteredProjects({
  selectedProjectId,
  query,
  includeProjectId,
  excludeChatProjects = false
}: Options) {
  const { projects, refetch } = useSyncedProjects({ includeProjectId })

  const { filteredProjects } = useMemo(() => {
    const selectedProject = projects?.find((p) => p.id === selectedProjectId)

    let filteredProjects: SyncProject[] = []

    if (!query) {
      // by default, sort by how often the viewer used the project
      filteredProjects =
        projects?.sort((a, b) => {
          if (a.recent_posts_count === b.recent_posts_count) {
            return a.name.localeCompare(b.name)
          }
          return b.recent_posts_count - a.recent_posts_count
        }) ?? []
    } else {
      filteredProjects = commandScoreSort(projects, query, (project) => project.name).slice(0, 10)

      if (selectedProject && !filteredProjects.some((p) => p.id === selectedProject.id)) {
        filteredProjects.push(selectedProject)
      }
    }

    if (excludeChatProjects) {
      filteredProjects = filteredProjects.filter((p) => !p.message_thread_id)
    }

    filteredProjects = filteredProjects.sort((a, b) => {
      if (a.archived && !b.archived) return 1
      if (!a.archived && b.archived) return -1
      return 0
    })

    return { filteredProjects }
  }, [excludeChatProjects, projects, query, selectedProjectId])

  return { filteredProjects, refetch }
}
