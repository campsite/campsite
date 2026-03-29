import { formatDate } from './legacy'

const RESOURCE_SUBJECTS = new Set(['posts', 'notes', 'calls', 'projects'])
const RESOURCE_MENTION_HREF_REGEX = /<resource-mention\b[^>]*\shref=(['"])(.*?)\1/gi

export function parseCampsiteResourceUrl(href: string) {
  let url: URL

  try {
    url = new URL(href)
  } catch {
    return null
  }

  const segments = url.pathname.split('/').filter(Boolean)

  if (segments.length < 3) {
    return null
  }

  const [org, subject, id] = segments

  if (!org || !id || !RESOURCE_SUBJECTS.has(subject)) {
    return null
  }

  return {
    org,
    subject,
    id
  } as const
}

export function extractResourceMentionHrefs(html?: string | null) {
  if (!html) {
    return []
  }

  const hrefs = new Set<string>()
  const regex = new RegExp(RESOURCE_MENTION_HREF_REGEX.source, RESOURCE_MENTION_HREF_REGEX.flags)
  let match: RegExpExecArray | null

  while ((match = regex.exec(html)) !== null) {
    const href = match[2]?.trim()

    if (href) {
      hrefs.add(href)
    }
  }

  return Array.from(hrefs)
}

export function buildPostResourceMention(organizationSlug: string, post: any) {
  return {
    id: post._id,
    post: {
      id: post._id,
      title: post.title || stripHtml(post.descriptionHtml) || 'Untitled post',
      created_at: new Date(post.createdAt).toISOString(),
      published_at: formatDate(post.publishedAt),
      url: `/${organizationSlug}/posts/${post._id}`
    },
    call: null,
    note: null,
    type_name: 'resource_mention'
  }
}

export function buildNoteResourceMention(organizationSlug: string, note: any) {
  return {
    id: note.publicId,
    post: null,
    call: null,
    note: {
      id: note.publicId,
      title: note.title || 'Untitled',
      created_at: new Date(note.createdAt).toISOString(),
      url: `/${organizationSlug}/notes/${note.publicId}`
    },
    type_name: 'resource_mention'
  }
}

export function buildCallResourceMention(organizationSlug: string, call: any) {
  return {
    id: call.publicId,
    post: null,
    call: {
      id: call.publicId,
      title: call.title || 'Untitled call',
      created_at: new Date(call.createdAt).toISOString(),
      url: `/${organizationSlug}/calls/${call.publicId}`
    },
    note: null,
    type_name: 'resource_mention'
  }
}

async function getPostById(ctx: any, organizationId: any, postId: string) {
  const posts = await ctx.db.query('posts').withIndex('by_organization_id', (q: any) => q.eq('organizationId', organizationId)).collect()

  return posts.find((post: any) => post._id === postId) ?? null
}

async function getNoteByPublicId(ctx: any, organizationId: any, noteId: string) {
  const note = await ctx.db
    .query('notes')
    .withIndex('by_public_id', (query: any) => query.eq('publicId', noteId))
    .unique()

  if (!note || note.organizationId !== organizationId) {
    return null
  }

  return note
}

async function getCallByPublicId(ctx: any, organizationId: any, callId: string) {
  const call = await ctx.db
    .query('calls')
    .withIndex('by_public_id', (query: any) => query.eq('publicId', callId))
    .unique()

  if (!call || call.organizationId !== organizationId) {
    return null
  }

  return call
}

export async function getLegacyResourceMentionByUrl(
  ctx: any,
  params: {
    organizationId: any
    organizationSlug: string
    url: string
  }
) {
  const parsed = parseCampsiteResourceUrl(params.url)

  if (!parsed || parsed.org !== params.organizationSlug) {
    return null
  }

  if (parsed.subject === 'posts') {
    const post = await getPostById(ctx, params.organizationId, parsed.id)
    return post ? buildPostResourceMention(params.organizationSlug, post) : null
  }

  if (parsed.subject === 'notes') {
    const note = await getNoteByPublicId(ctx, params.organizationId, parsed.id)
    return note ? buildNoteResourceMention(params.organizationSlug, note) : null
  }

  if (parsed.subject === 'calls') {
    const call = await getCallByPublicId(ctx, params.organizationId, parsed.id)
    return call ? buildCallResourceMention(params.organizationSlug, call) : null
  }

  return null
}

export async function getLegacyResourceMentionsFromHtml(
  ctx: any,
  params: {
    organizationId: any
    organizationSlug: string
    html?: string | null
  }
) {
  const hrefs = extractResourceMentionHrefs(params.html)

  if (hrefs.length === 0) {
    return []
  }

  const mentions = await Promise.all(
    hrefs.map((url) =>
      getLegacyResourceMentionByUrl(ctx, {
        organizationId: params.organizationId,
        organizationSlug: params.organizationSlug,
        url
      })
    )
  )

  return mentions.filter(Boolean)
}

function stripHtml(value?: string | null) {
  if (!value) {
    return ''
  }

  return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}
