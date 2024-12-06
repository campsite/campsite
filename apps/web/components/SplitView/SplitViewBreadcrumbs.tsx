import { useAtom } from 'jotai'
import { useRouter } from 'next/router'

import { Button } from '@campsite/ui/Button'
import { LayeredHotkeys } from '@campsite/ui/DismissibleLayer'
import { DoubleChevronRightIcon, MaximizeIcon } from '@campsite/ui/Icons'

import { selectedSplitViewSubjectAtom } from '@/components/SplitView/utils'

export function SplitViewBreadcrumbs() {
  const router = useRouter()
  const [selectedSubject, setSelectedSubject] = useAtom(selectedSplitViewSubjectAtom)

  const handleExpand = () => {
    if (!selectedSubject || !selectedSubject.href) return

    router.push(selectedSubject.href)
  }

  return (
    <div className='flex min-w-0 flex-1 gap-1.5'>
      <LayeredHotkeys keys={['mod+enter']} callback={handleExpand} />

      <Button
        iconOnly={<DoubleChevronRightIcon size={24} />}
        variant='plain'
        accessibilityLabel='Close split view'
        tooltip='Close split view'
        tooltipShortcut='Esc'
        onClick={() => setSelectedSubject(undefined)}
      />
      <Button
        iconOnly={<MaximizeIcon size={20} />}
        variant='plain'
        accessibilityLabel='Open in full screen'
        tooltip='Open in full screen'
        tooltipShortcut='mod+enter'
        onClick={handleExpand}
      />
    </div>
  )
}
