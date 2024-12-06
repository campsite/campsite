import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useFormContext, useWatch } from 'react-hook-form'

import { PostSchema } from '@/components/Post/schema'
import { useFormSetValue } from '@/components/PostComposer/hooks/useFormSetValue'
import { usePostComposerIsEditingPost } from '@/components/PostComposer/hooks/usePostComposerIsEditingPost'
import { usePostComposerLastUsedProjectId } from '@/components/PostComposer/hooks/usePostComposerLastUsedProjectId'
import { useSyncedProjects } from '@/hooks/useSyncedProjects'

function InnerPostComposerSyncLastUsedProject() {
  const { control } = useFormContext<PostSchema>()
  const projectId = useWatch({ control, name: 'project_id' })
  const { lastUsedProjectId, setLastUsedProjectId } = usePostComposerLastUsedProjectId()
  const { projects } = useSyncedProjects()
  const setValue = useFormSetValue<PostSchema>()

  useEffect(() => {
    // if the last-used project is ever missing, we want to set the project to the default project
    const lastUsedProjectNotFound =
      lastUsedProjectId && projects && projects.length && !projects.some((p) => p.id === lastUsedProjectId)

    // skip if disabled
    // skip if the last-used project is found in synced projects
    if (!lastUsedProjectId || lastUsedProjectNotFound) {
      // find a default to set as the initial last-used project
      const defaultProject = projects?.find((p) => p.is_general) ?? projects?.at(0)

      if (!defaultProject) {
        return
      }

      setLastUsedProjectId(defaultProject.id)

      // if the user hasn't selected a project or the selected project no longer exists
      if (!projectId || lastUsedProjectNotFound) {
        // do not dirty the form state on initial selection
        setValue('project_id', defaultProject.id, { shouldDirty: false, shouldValidate: false })
      }
    }
  }, [lastUsedProjectId, projectId, projects, setLastUsedProjectId, setValue])

  useEffect(() => {
    if (projectId) {
      setLastUsedProjectId(projectId)
    }
  }, [projectId, setLastUsedProjectId])

  return null
}

export function PostComposerSyncLastUsedProject() {
  const router = useRouter()
  const isProjectPage = !!router.query.projectId
  const { isEditingPost } = usePostComposerIsEditingPost()

  const enabled = !isEditingPost && !isProjectPage

  if (!enabled) return null
  return <InnerPostComposerSyncLastUsedProject />
}
