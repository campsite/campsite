import { useAtomValue } from 'jotai'

import { layersAtom } from '.'

/**
 * Drop this in the app to show the current DismissibleLayer stack in the UI.
 */
export function DismissibleLayerDevtools() {
  const layers = useAtomValue(layersAtom)

  return (
    <div className='bg-secondary fixed bottom-4 right-4 z-[9999] p-3 font-mono shadow-xl'>
      <ul>
        {Array.from(layers.values()).map((layer) => (
          <li key={layer}>{layer}</li>
        ))}
      </ul>
    </div>
  )
}
