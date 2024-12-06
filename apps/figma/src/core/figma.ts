import { emit, on, once } from '@create-figma-plugin/utilities'
import { DocumentMetadata } from 'src/types'

import { ExportedNode } from './export'
import { FormSchema } from './schema'

type KeysMatching<T, V> = { [K in keyof T]-?: T[K] extends V ? K : never }[keyof T]

interface Events {
  tokenchange: string | undefined
  refresh: never
  signin: string
  signout: never
  titlechange: string
  organizationchange: string
  projectchange: { organization: string; project: string }
  filekeychange: string
  appready: never
  initialdata: Partial<FormSchema>
  previewready: ExportedNode[]
  submitstart: never
  metadataready: DocumentMetadata
  uploadstart: never
  exportready: ExportedNode
  exportend: never
}

// Allow `emit` to be called without a second arg if value is `never`
function $emit<K extends KeysMatching<Events, never>>(event: K): void
function $emit<K extends keyof Events>(event: K, value: Events[K]): void
function $emit<K extends keyof Events>(event: K, value?: Events[K]) {
  emit(event, value as any)
}

export const $figma = {
  emit: $emit,

  on<K extends keyof Events>(event: K, callback: (value: Events[K]) => void) {
    on(event, callback)
  },

  once<K extends keyof Events>(event: K, callback: (value: Events[K]) => void) {
    once(event, callback)
  }
}
