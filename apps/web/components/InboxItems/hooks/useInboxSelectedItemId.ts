import { useCallback } from 'react'
import { useAtom, useSetAtom } from 'jotai'
import { atomFamily, atomWithStorage } from 'jotai/utils'

import { useScope } from '@/contexts/scope'

/**
 * Save the inbox key to local storage so that navigating back to the inbox page will load the correct item.
 */

const selectedItemInboxIdAtomFamily = atomFamily((scope: string) =>
  atomWithStorage<string | undefined>(`${scope}:selected-inbox-item-id`, undefined)
)
const detailItemInboxIdAtomFamily = atomFamily((scope: string) =>
  atomWithStorage<string | undefined>(`${scope}:detail-inbox-item-id`, undefined)
)

function useInboxSelectedItemId() {
  const { scope } = useScope()
  const [selectedItemInboxId, setSelectedItemInboxId] = useAtom(selectedItemInboxIdAtomFamily(`${scope}`))

  return { selectedItemInboxId, setSelectedItemInboxId }
}

function useInboxDetailItemId() {
  const { scope } = useScope()
  const [detailItemInboxId, setDetailItemInboxId] = useAtom(detailItemInboxIdAtomFamily(`${scope}`))

  return { detailItemInboxId, setDetailItemInboxId }
}

function useInboxSetSelection() {
  const { scope } = useScope()
  const setSelectedItemInboxId = useSetAtom(selectedItemInboxIdAtomFamily(`${scope}`))
  const setDetailItemInboxId = useSetAtom(detailItemInboxIdAtomFamily(`${scope}`))

  const setInboxSelection = useCallback(
    (id: string) => {
      setSelectedItemInboxId(id)
      setDetailItemInboxId(id)
    },
    [setSelectedItemInboxId, setDetailItemInboxId]
  )

  return { setInboxSelection }
}

export { useInboxDetailItemId, useInboxSelectedItemId, useInboxSetSelection }
