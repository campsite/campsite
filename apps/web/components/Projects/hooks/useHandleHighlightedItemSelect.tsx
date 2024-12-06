import { useCallback } from 'react'
import { useSetAtom } from 'jotai'
import Router from 'next/router'

import { lastUsedSubjectAtom } from '@/components/Post/PostNavigationButtons'
import { useIsSplitViewAvailable } from '@/components/SplitView/hooks'
import { selectedSplitViewSubjectAtom } from '@/components/SplitView/utils'
import { decodeCommandListSubject } from '@/utils/commandListSubject'

export function useHandleCommandListSubjectSelect() {
  const { isSplitViewAvailable } = useIsSplitViewAvailable()
  const setSelectedSplitViewSubject = useSetAtom(selectedSplitViewSubjectAtom)
  const setLastUsedSubject = useSetAtom(lastUsedSubjectAtom)

  const handleSelect = useCallback(
    (value: string, event?: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      const subject = decodeCommandListSubject(value)

      if (!subject) return

      if (
        // command/meta + click
        event?.metaKey ||
        // shift + click
        event?.shiftKey ||
        // middle mouse click
        event?.button === 1
      ) {
        window.open(subject.href, '_blank')
      } else if (isSplitViewAvailable) {
        setSelectedSplitViewSubject(subject)
      } else {
        setLastUsedSubject(subject)
        Router.push(subject.href)
      }
    },
    [setLastUsedSubject, setSelectedSplitViewSubject, isSplitViewAvailable]
  )

  return { handleSelect }
}
