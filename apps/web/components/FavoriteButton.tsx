import { Button, StarFilledIcon, StarOutlineIcon } from '@campsite/ui'
import { cn } from '@campsite/ui/src/utils'

interface Props {
  hasFavorited: boolean | undefined
  onFavorite: () => void
  onRemoveFavorite: () => void
  disabled?: boolean
  variant?: 'base' | 'plain'
  shortcutEnabled?: boolean
}

export function FavoriteButton({
  variant = 'plain',
  hasFavorited = false,
  onFavorite,
  onRemoveFavorite,
  disabled,
  shortcutEnabled
}: Props) {
  return (
    <Button
      variant={variant}
      className={cn({
        'hover:text-primary text-yellow-400': hasFavorited,
        'text-quaternary hover:text-primary': !hasFavorited
      })}
      iconOnly={hasFavorited ? <StarFilledIcon /> : <StarOutlineIcon />}
      onClick={() => {
        if (hasFavorited) {
          onRemoveFavorite()
        } else {
          onFavorite()
        }
      }}
      tooltip={hasFavorited ? 'Unfavorite' : 'Favorite'}
      tooltipShortcut={shortcutEnabled ? 'alt+f' : undefined}
      disabled={disabled || false}
      accessibilityLabel={hasFavorited ? 'Unfavorite' : 'Favorite'}
    />
  )
}
