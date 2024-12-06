import { useEffect } from 'react'
import { atom, useAtomValue, useSetAtom } from 'jotai'

type Modality = 'cursor' | 'keyboard' | 'touch'
const activeModalityAtom = atom<Modality | undefined>(undefined)

function ActiveModalityProvider() {
  const setActiveModality = useSetAtom(activeModalityAtom)

  useEffect(() => {
    const handleMouseMove = () => setActiveModality('cursor')
    const handleMouseDown = () => setActiveModality('cursor')
    const handleKeyDown = () => setActiveModality('keyboard')
    const handleTouchStart = () => setActiveModality('touch')

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('touchstart', handleTouchStart)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('touchstart', handleTouchStart)
    }
  }, [setActiveModality])

  return null
}

const useActiveModality = () => {
  const activeModality = useAtomValue(activeModalityAtom)

  return { activeModality }
}

export { ActiveModalityProvider, useActiveModality }
export type { Modality }
