import atomWithDebounce from '@/utils/atomWithDebounce'
import { CommandListSubject } from '@/utils/commandListSubject'

const { currentValueAtom: selectedSplitViewSubjectAtom, debouncedValueAtom: debouncedSelectedSplitViewSubjectAtom } =
  atomWithDebounce<CommandListSubject | undefined>(undefined, 200)

export { selectedSplitViewSubjectAtom, debouncedSelectedSplitViewSubjectAtom }
