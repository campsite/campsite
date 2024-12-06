import { useEffect } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'

import { Command } from '@campsite/ui/Command'

import { lastUsedSubjectAtom } from '@/components/Post/PostNavigationButtons'
import { useIsSplitViewAvailable } from '@/components/SplitView/hooks'
import { debouncedSelectedSplitViewSubjectAtom, selectedSplitViewSubjectAtom } from '@/components/SplitView/utils'
import { decodeCommandListSubject, encodeCommandListSubject } from '@/utils/commandListSubject'

interface SubjectCommandProps extends React.PropsWithChildren {}

export function SubjectCommand({ children }: SubjectCommandProps) {
  const lastUsedSubject = useAtomValue(lastUsedSubjectAtom)
  const selectedSplitViewSubject = useAtomValue(selectedSplitViewSubjectAtom)
  const setDebouncedSelectedSplitViewSubject = useSetAtom(debouncedSelectedSplitViewSubjectAtom)
  const { isSplitViewAvailable } = useIsSplitViewAvailable()

  // Reset split view selection when navigating away from the page
  useEffect(() => {
    return () => {
      setDebouncedSelectedSplitViewSubject(undefined)
    }
  }, [setDebouncedSelectedSplitViewSubject])

  return (
    <Command
      className='flex flex-1'
      focusSelection
      disableAutoSelect
      {...(!isSplitViewAvailable
        ? { defaultValue: lastUsedSubject ? encodeCommandListSubject(lastUsedSubject) : undefined }
        : {
            value: selectedSplitViewSubject ? encodeCommandListSubject(selectedSplitViewSubject) : '',
            onValueChange: (val, event) => {
              if (event?.metaKey || event?.shiftKey) {
                return
              }

              setDebouncedSelectedSplitViewSubject(decodeCommandListSubject(val))
            },
            disablePointerSelection: true
          })}
    >
      {children}
    </Command>
  )
}
