import { z } from 'zod'

import { Call, Note, Post } from '@campsite/types/generated'

type SubjectType = 'post' | 'note' | 'call'

const commandListSubjectSchema = z.object({
  subjectType: z.enum(['post', 'note', 'call']),
  id: z.string(),
  href: z.string(),
  pinned: z
    .string()
    .optional()
    .transform((val) => val === 'true')
})

type CommandListSubject = z.infer<typeof commandListSubjectSchema>

function isPost(subject: Post | Note | Call): subject is Post {
  return subject.type_name === 'post'
}

function isNote(subject: Post | Note | Call): subject is Note {
  return subject.type_name === 'note'
}

function isCall(subject: Post | Note | Call): subject is Call {
  return subject.type_name === 'call'
}

function isCommandListSubject(subject: Post | Note | Call | CommandListSubject): subject is CommandListSubject {
  return typeof subject === 'object' && 'subjectType' in subject && 'id' in subject
}

function getSubjectType(subject: Post | Note | Call): SubjectType | undefined {
  if (isPost(subject)) return 'post'
  if (isNote(subject)) return 'note'
  if (isCall(subject)) return 'call'
}

function getCommandListSubject(subject: Post | Note | Call): CommandListSubject | undefined {
  const subjectType = getSubjectType(subject)

  if (!subjectType) return undefined

  return {
    subjectType,
    id: subject.id,
    href: isPost(subject) ? subject.path : subject.url,
    pinned: false
  }
}

function encodeCommandListSubject(
  subject: Post | Note | Call | CommandListSubject,
  { href, pinned = false }: { href?: string; pinned?: boolean } = {}
): string | undefined {
  if (isCommandListSubject(subject)) {
    const params = new URLSearchParams([
      ['subject-type', subject.subjectType],
      ['id', subject.id],
      ['href', subject.href],
      ['pinned', `${subject.pinned}`]
    ])

    return params.toString()
  }

  const subjectType = getSubjectType(subject)

  if (!subjectType) return undefined

  const params = new URLSearchParams([
    ['subject-type', subjectType],
    ['id', subject.id],
    ['href', href || ''],
    ['pinned', `${pinned}`]
  ])

  return params.toString()
}

function decodeCommandListSubject(encodedSubject: string): CommandListSubject | undefined {
  const params = new URLSearchParams(encodedSubject)
  const parsed = commandListSubjectSchema.safeParse({
    subjectType: params.get('subject-type'),
    id: params.get('id'),
    href: params.get('href'),
    pinned: params.get('pinned')
  })

  if (!parsed.success) return undefined
  return parsed.data
}

export type { CommandListSubject }
export { encodeCommandListSubject, decodeCommandListSubject, getCommandListSubject }
