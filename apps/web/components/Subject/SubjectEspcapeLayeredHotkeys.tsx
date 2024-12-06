import { useSetAtom } from 'jotai'
import { useRouter } from 'next/router'

import { LayeredHotkeys } from '@campsite/ui/DismissibleLayer'

import { useGoBack } from '@/components/Providers/HistoryProvider'
import { useIsSplitViewAvailable } from '@/components/SplitView/hooks'
import { selectedSplitViewSubjectAtom } from '@/components/SplitView/utils'

export function SubjectEspcapeLayeredHotkeys() {
  const goBack = useGoBack()
  const router = useRouter()
  const { isSplitViewAvailable } = useIsSplitViewAvailable()
  const setSelectedSplitViewSubject = useSetAtom(selectedSplitViewSubjectAtom)
  const isInbox = router.pathname.startsWith('/[org]/inbox/[inboxView]')

  return (
    <LayeredHotkeys
      keys='escape'
      callback={() => {
        if (isSplitViewAvailable) {
          setSelectedSplitViewSubject(undefined)
        } else {
          goBack()
        }
      }}
      options={{ enabled: !isInbox, skipEscapeWhenDisabled: true }}
    />
  )
}
