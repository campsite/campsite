import { Transaction } from '@tiptap/pm/state'

export function isRemoteTransaction(tr: Transaction): boolean {
  // depending on the transaction or the environment, the key may be different
  // check against known y-sync keys
  const meta = tr.getMeta('y-sync') || tr.getMeta('y-sync$') || tr.getMeta('y-sync$1')

  return !!meta?.isChangeOrigin
}
