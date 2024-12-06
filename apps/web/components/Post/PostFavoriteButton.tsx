import { Post } from '@campsite/types'
import { LayeredHotkeys } from '@campsite/ui/DismissibleLayer'

import { useCreatePostFavorite } from '@/hooks/useCreatePostFavorite'
import { useDeletePostFavorite } from '@/hooks/useDeletePostFavorite'

import { FavoriteButton } from '../FavoriteButton'

interface PostFavoriteButtonProps {
  post: Post
  shortcutEnabled?: boolean
}

export function PostFavoriteButton({ post, shortcutEnabled = false }: PostFavoriteButtonProps) {
  const { mutate: createFavorite, isPending: isCreatePending } = useCreatePostFavorite()
  const { mutate: deleteFavorite, isPending: isDeletePending } = useDeletePostFavorite()

  return (
    <>
      {shortcutEnabled && (
        <LayeredHotkeys
          keys='alt+f'
          callback={() => {
            if (post.viewer_has_favorited) {
              deleteFavorite(post.id)
            } else {
              createFavorite(post)
            }
          }}
        />
      )}

      <FavoriteButton
        hasFavorited={post.viewer_has_favorited}
        onFavorite={() => createFavorite(post)}
        onRemoveFavorite={() => deleteFavorite(post.id)}
        disabled={isCreatePending || isDeletePending}
        shortcutEnabled={shortcutEnabled}
      />
    </>
  )
}
