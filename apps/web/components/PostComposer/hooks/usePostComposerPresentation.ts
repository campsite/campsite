import { useAtom, useSetAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { isMobile } from 'react-device-detect'

import {
  getIsPostComposerExpandedDefaultValue,
  isPostComposerExpandedAtomFamily,
  PostComposerPresentation
} from '@/components/PostComposer/utils'

const postComposerPresentationAtom = atomWithStorage<PostComposerPresentation>(
  'campsite:post-composer-presentation',
  PostComposerPresentation.Dialog
)

export function usePostComposerPresentation() {
  const [postComposerPresentation, setPostComposerPresentation] = useAtom(postComposerPresentationAtom)
  const setIsPostComposerExpanded = useSetAtom(isPostComposerExpandedAtomFamily(postComposerPresentation))

  const handleSetPostComposerPresentation = (presentation: PostComposerPresentation) => {
    setPostComposerPresentation(presentation)
    // Reset the expanded state to the default value
    setIsPostComposerExpanded(getIsPostComposerExpandedDefaultValue(postComposerPresentation))
  }

  return {
    postComposerPresentation: isMobile ? PostComposerPresentation.Dialog : postComposerPresentation,
    setPostComposerPresentation: handleSetPostComposerPresentation
  }
}
