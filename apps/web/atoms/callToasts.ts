import { atom } from 'jotai'
import { v4 as uuid } from 'uuid'

export const callToastsAtom = atom<Map<string, string>>(new Map())

export const addCallToastAtom = atom(undefined, (get, set, message: string) => {
  const newMessageId = uuid()

  set(callToastsAtom, new Map(get(callToastsAtom).set(newMessageId, message)))

  setTimeout(() => {
    set(deleteCallToastAtom, newMessageId)
  }, 6000)
})

const deleteCallToastAtom = atom(undefined, (get, set, id: string) => {
  const callToastMessages = get(callToastsAtom)

  callToastMessages.delete(id)
  set(callToastsAtom, new Map(callToastMessages))
})
