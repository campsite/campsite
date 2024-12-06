import { Project } from '@campsite/types'
import { LayeredHotkeys } from '@campsite/ui/DismissibleLayer'

import { useCreateProjectFavorite } from '@/hooks/useCreateProjectFavorite'
import { useDeleteProjectFavorite } from '@/hooks/useDeleteProjectFavorite'

import { FavoriteButton } from '../FavoriteButton'

interface Props {
  project: Project
  shortcutEnabled?: boolean
}

export function ProjectFavoriteButton({ project, shortcutEnabled = false }: Props) {
  const { mutate: createFavorite, isPending: isCreatePending } = useCreateProjectFavorite()
  const { mutate: deleteFavorite, isPending: isDeletePending } = useDeleteProjectFavorite()
  const isPending = isCreatePending || isDeletePending

  /**
   * Allow users to un/favorite projects if they are a member.
   * Show the button even if the project is archived.
   */
  if (!project.viewer_is_member) return null

  return (
    <>
      {shortcutEnabled && (
        <LayeredHotkeys
          keys='alt+f'
          callback={() => {
            if (project.viewer_has_favorited) {
              deleteFavorite(project.id)
            } else {
              createFavorite(project)
            }
          }}
        />
      )}

      <FavoriteButton
        hasFavorited={project.viewer_has_favorited}
        onFavorite={() => createFavorite(project)}
        onRemoveFavorite={() => deleteFavorite(project.id)}
        disabled={isPending}
        shortcutEnabled={shortcutEnabled}
      />
    </>
  )
}
