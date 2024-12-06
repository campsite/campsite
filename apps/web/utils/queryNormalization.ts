import { Attachment, Call, Comment, MessageThread, Note, Post, Project, ResourceMention, User } from '@campsite/types'

import { useQueryNormalizer } from '@/utils/normy/QueryNormalizerProvider'

import { pluckKeyValues } from './pluckKeyValues'

interface NormalizedDataTypes {
  project: Project
  note: Note
  call: Call
  post: Post
  thread: MessageThread
  comment: Comment
  attachment: Attachment
  resource_mention: ResourceMention
  user: User
}

const normalizedIdKey = 'id'
const normalizedTypeNameKey = 'type_name'

const normalizedKey = (type: string, id: string) => `${type}:${id}`

export function getNormalizedKey(data: any) {
  if (normalizedIdKey in data && normalizedTypeNameKey in data) {
    return normalizedKey(data[normalizedTypeNameKey], data[normalizedIdKey])
  }
}

function normalizedData<Key extends keyof NormalizedDataTypes, TData = NormalizedDataTypes[Key]>(
  type: Key,
  data: { [normalizedIdKey]: string } & Partial<TData>
) {
  return { [normalizedTypeNameKey]: type, ...data }
}

type UpdateFn<T> = (old: T) => Partial<T>

export function setNormalizedData<Key extends keyof NormalizedDataTypes, TData = NormalizedDataTypes[Key]>({
  queryNormalizer,
  type,
  id,
  update
}: {
  queryNormalizer: ReturnType<typeof useQueryNormalizer>
  type: Key
  id: string
  update: Partial<TData> | UpdateFn<TData>
}) {
  let next: Partial<TData>

  if (typeof update === 'function') {
    const old = getNormalizedData<Key, TData>({ queryNormalizer, type, id })

    if (!old) return
    next = update(old)
  } else {
    next = update
  }

  queryNormalizer.setNormalizedData(normalizedData(type, { id, ...next }))
}

export function createNormalizedOptimisticUpdate<
  Key extends keyof NormalizedDataTypes,
  TData = NormalizedDataTypes[Key] & { [key: string]: any }
>({
  queryNormalizer,
  type,
  id,
  update
}: {
  queryNormalizer: ReturnType<typeof useQueryNormalizer>
  type: Key
  id: string
  update: Partial<TData> | UpdateFn<TData>
}) {
  const previous = getNormalizedData<Key, TData>({ queryNormalizer, type, id })

  if (!previous) return

  const next = typeof update === 'function' ? update(previous) : update
  // only pluck key-values from previous so that rollback will only affect the keys that are being updated
  const previousTrimmed = pluckKeyValues(next, previous)

  return {
    optimisticData: normalizedData(type, { id, ...next }),
    rollbackData: normalizedData(type, { id, ...previousTrimmed })
  }
}

export function getNormalizedData<Key extends keyof NormalizedDataTypes, TData = NormalizedDataTypes[Key]>({
  queryNormalizer,
  type,
  id
}: {
  queryNormalizer: ReturnType<typeof useQueryNormalizer>
  type: Key
  id: string
}) {
  return queryNormalizer.getObjectById(normalizedKey(type, id)) as TData | undefined
}
