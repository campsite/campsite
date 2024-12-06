import { atom, WritableAtom } from 'jotai'

/**
 * @see https://jotai.org/docs/recipes/atom-with-toggle
 */
export function atomWithToggle(initialValue?: boolean): WritableAtom<boolean, [boolean?], void> {
  const anAtom = atom(initialValue, (get, set, nextValue?: boolean) => {
    const update = nextValue ?? !get(anAtom)

    set(anAtom, update)
  })

  return anAtom as WritableAtom<boolean, [boolean?], void>
}
