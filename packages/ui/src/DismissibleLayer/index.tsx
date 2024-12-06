import React, { createContext, useContext, useId, useLayoutEffect, useMemo } from 'react'
import { Slot } from '@radix-ui/react-slot'
import { atom, useAtomValue, useSetAtom } from 'jotai'

const rootLayerId = 'root'

// Update the initial state of layersAtom to include the type
export const layersAtom = atom([rootLayerId])

const addLayerAtom = atom(null, (get, set, layer: string) => {
  const layers = get(layersAtom)

  if (layers.includes(layer)) {
    return
  }

  const newLayers = [...layers, layer]

  set(layersAtom, newLayers)
})

const removeLayerAtom = atom(null, (get, set, layer: string) => {
  const layers = get(layersAtom)

  set(
    layersAtom,
    layers.filter((l) => l !== layer)
  )
})

const LayerContext = createContext<string>(rootLayerId)

export const DismissibleLayer = React.forwardRef<HTMLDivElement, { children: React.ReactNode }>(({ children }, ref) => {
  const layer = useId()
  const addLayer = useSetAtom(addLayerAtom)
  const removeLayer = useSetAtom(removeLayerAtom)

  useLayoutEffect(() => {
    addLayer(layer)

    return () => {
      removeLayer(layer)
    }
  }, [addLayer, layer, removeLayer])

  return (
    <LayerContext.Provider value={layer}>
      <Slot ref={ref}>{children}</Slot>
    </LayerContext.Provider>
  )
})

DismissibleLayer.displayName = 'DismissibleLayer'

export const useIsTopLayer = () => {
  const id = useContext(LayerContext)

  return useAtomValue(useMemo(() => atom((get) => get(layersAtom).at(-1) === id), [id]))
}

export { DismissibleLayerDevtools } from './DismissibleLayerDevtools'
export { useLayeredHotkeys } from './useLayeredHotkeys'
export { LayeredHotkeys } from './LayeredHotkeys'
