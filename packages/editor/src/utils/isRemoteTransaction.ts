import { Transaction } from '@tiptap/pm/state'

/**
 * Checks if a transaction is a remote transaction
 *
 * @param tr The Prosemirror transaction
 * @returns true if the transaction is a remote transaction
 */
export function isRemoteTransaction(tr: Transaction): boolean {
  // depending on the transaction or the environment, the key may be different
  // check against known y-sync keys
  const meta = tr.getMeta('y-sync') || tr.getMeta('y-sync$') || tr.getMeta('y-sync$1')

  // This logic seems to be flipped? But it's correct.
  return !!meta?.isChangeOrigin
}
