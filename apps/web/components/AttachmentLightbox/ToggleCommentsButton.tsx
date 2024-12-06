import { useAtom } from 'jotai'

import { Button, CanvasCommentIcon, LayeredHotkeys } from '@campsite/ui'

import { displayCanvasCommentsAtom } from '../CanvasComments/CanvasComments'

export function ToggleCommentsButton() {
  const [displayCanvasComments, setDisplayCanvasComments] = useAtom(displayCanvasCommentsAtom)

  const toggleCommentsVisibility = () => {
    setDisplayCanvasComments(!displayCanvasComments)
  }

  return (
    <>
      <LayeredHotkeys keys='shift+c' callback={toggleCommentsVisibility} options={{ preventDefault: true }} />

      <Button
        tooltip='Toggle comments'
        tooltipShortcut='shift+c'
        variant={displayCanvasComments ? 'flat' : 'plain'}
        onClick={toggleCommentsVisibility}
        iconOnly={<CanvasCommentIcon />}
        accessibilityLabel={displayCanvasComments ? 'Hide comments' : 'Show comments'}
        aria-pressed={!displayCanvasComments}
      />
    </>
  )
}
