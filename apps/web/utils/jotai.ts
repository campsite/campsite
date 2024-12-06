import { WritableAtom } from 'jotai'
import { INTERNAL_InferAtomTuples } from 'jotai/react/utils/useHydrateAtoms'
import { useHydrateAtoms } from 'jotai/utils'

type AnyWritableAtom = WritableAtom<unknown, any[], any>

/**
 * @see https://jotai.org/docs/guides/initialize-atom-on-render
 * @see https://github.com/pmndrs/jotai/blob/main/src/react/utils/useHydrateAtoms.ts
 */
export function HydrateAtoms<T extends (readonly [AnyWritableAtom, unknown])[]>({
  atomValues,
  children
}: {
  atomValues: INTERNAL_InferAtomTuples<T>
  children: React.ReactNode
}): React.ReactNode
export function HydrateAtoms<T extends Map<AnyWritableAtom, unknown>>({
  atomValues,
  children
}: {
  atomValues: T
  children: React.ReactNode
}): React.ReactNode
export function HydrateAtoms<T extends Iterable<readonly [AnyWritableAtom, unknown]>>({
  atomValues,
  children
}: {
  atomValues: INTERNAL_InferAtomTuples<T>
  children: React.ReactNode
}): React.ReactNode {
  useHydrateAtoms(new Map(atomValues))
  return children
}
