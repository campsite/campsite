import { useAutoplayError } from '@100mslive/react-sdk'

import { Button } from '@campsite/ui/Button'
import { UIText } from '@campsite/ui/Text'
import { ANIMATION_CONSTANTS, cn, CONTAINER_STYLES } from '@campsite/ui/utils'

export function AutoplayBlockedError() {
  const { error, resetError, unblockAudio } = useAutoplayError()

  if (!error) return null

  return (
    <div
      className={cn(
        CONTAINER_STYLES.base,
        CONTAINER_STYLES.shadows,
        ANIMATION_CONSTANTS,
        'bg-elevated dark absolute flex flex-col gap-3 rounded-lg p-4 text-center'
      )}
    >
      <UIText>Your browser has blocked audio.</UIText>
      <Button
        variant='primary'
        onClick={() => {
          unblockAudio()
          resetError()
        }}
      >
        Allow Audio
      </Button>
    </div>
  )
}
