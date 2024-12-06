import { Call } from '@campsite/types'
import { LayeredHotkeys } from '@campsite/ui/DismissibleLayer'

import { useCreateCallFavorite } from '@/hooks/useCreateCallFavorite'
import { useDeleteCallFavorite } from '@/hooks/useDeleteCallFavorite'

import { FavoriteButton } from '../FavoriteButton'

interface Props {
  call: Call
  shortcutEnabled?: boolean
}

export function CallFavoriteButton({ call, shortcutEnabled = false }: Props) {
  const createFavorite = useCreateCallFavorite()
  const deleteFavorite = useDeleteCallFavorite()

  return (
    <>
      {shortcutEnabled && (
        <LayeredHotkeys
          keys='alt+f'
          callback={() => {
            if (call.viewer_has_favorited) {
              deleteFavorite.mutate(call.id)
            } else {
              createFavorite.mutate(call)
            }
          }}
        />
      )}

      <FavoriteButton
        hasFavorited={call.viewer_has_favorited}
        onFavorite={() => createFavorite.mutate(call)}
        onRemoveFavorite={() => deleteFavorite.mutate(call.id)}
        shortcutEnabled={shortcutEnabled}
      />
    </>
  )
}
