import { v } from 'convex/values'

import { query } from './_generated/server'
import { buildLegacyGroupedReactions, buildLegacySubjectFollowUps, hasLegacyFavorite, hasLegacyPostSubscription } from './engagement'
import { buildLegacyAvatarUrls, buildLegacyMediaUrl, buildLegacyMember as buildLegacyMemberRecord, formatDate } from './legacy'
import {
  buildCallResourceMention,
  buildNoteResourceMention,
  buildPostResourceMention,
  getLegacyResourceMentionsFromHtml,
  getLegacyResourceMentionByUrl as resolveLegacyResourceMentionByUrl
} from './resourceMentions'
import { buildWorkspaceState } from './workspace'

const MAX_MIXED_RESULTS = 20
const MAX_POST_RESULTS = 100
const DEFAULT_POST_RESULTS = 20

const defaultProject = {
  id: 'general',
  name: 'General',
  accessory: null,
  private: false,
  archived: false,
  message_thread_id: null
}

function createError(message: string, code: string) {
  return new Error(`${code}:${message}`)
}

function normalizeText(value?: string | null) {
  return value?.trim().toLowerCase() || ''
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function stripHtml(value?: string | null) {
  if (!value) {
    return ''
  }

  return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

function tokenizeQuery(value: string) {
  return normalizeText(value)
    .split(/\s+/)
    .filter(Boolean)
}

function matchesAllTokens(value: string, tokens: string[]) {
  if (!tokens.length) {
    return true
  }

  const haystack = normalizeText(value)

  return tokens.every((token) => haystack.includes(token))
}

function collectTokenMatches(value: string, tokens: string[]) {
  const lowerValue = normalizeText(value)

  return tokens.filter((token) => lowerValue.includes(token))
}

function highlightValue(value: string, tokens: string[]) {
  if (!value.trim()) {
    return null
  }

  const matchedTokens = collectTokenMatches(value, tokens)

  if (matchedTokens.length === 0) {
    return null
  }

  const pattern = new RegExp(`(${matchedTokens.map(escapeRegExp).join('|')})`, 'gi')
  const escaped = escapeHtml(value)

  return escaped.replace(pattern, '<mark>$1</mark>')
}

function buildExcerptHighlight(value: string, tokens: string[]) {
  const text = value.trim()

  if (!text) {
    return null
  }

  const lowerText = text.toLowerCase()
  const firstMatchIndex = tokens.reduce((bestIndex, token) => {
    const index = lowerText.indexOf(token)

    if (index === -1) {
      return bestIndex
    }

    return bestIndex === -1 ? index : Math.min(bestIndex, index)
  }, -1)

  if (firstMatchIndex === -1) {
    return null
  }

  const start = Math.max(0, firstMatchIndex - 40)
  const end = Math.min(text.length, firstMatchIndex + 120)
  const excerpt = text.slice(start, end).trim()

  return highlightValue(excerpt, tokens)
}

function scoreTextMatch(value: string, tokens: string[], weights: { exact: number; prefix: number; include: number }) {
  if (!value.trim() || !tokens.length) {
    return 0
  }

  const normalized = normalizeText(value)

  if (!matchesAllTokens(normalized, tokens)) {
    return 0
  }

  const phrase = tokens.join(' ')

  if (normalized === phrase) {
    return weights.exact
  }

  if (normalized.startsWith(phrase)) {
    return weights.prefix
  }

  return weights.include
}

async function getOrganizationContext(ctx: any, slug: string) {
  const state = await buildWorkspaceState(ctx)
  const membershipEntry = state.memberships.find((entry: any) => entry.organization?.slug === slug)

  if (!membershipEntry?.organization || membershipEntry.membership?.discardedAt) {
    return null
  }

  return {
    ...state,
    organization: membershipEntry.organization,
    viewerMembership: membershipEntry.membership
  }
}

async function getUserByTokenIdentifier(ctx: any, tokenIdentifier: string) {
  return await ctx.db
    .query('users')
    .withIndex('by_token_identifier', (q: any) => q.eq('tokenIdentifier', tokenIdentifier))
    .unique()
}

async function getOrganizationMembershipForToken(ctx: any, organizationId: any, tokenIdentifier: string) {
  return await ctx.db
    .query('organizationMemberships')
    .withIndex('by_organization_and_user', (q: any) =>
      q.eq('organizationId', organizationId).eq('userTokenIdentifier', tokenIdentifier)
    )
    .unique()
}

async function buildLegacyMember(ctx: any, organizationId: any, tokenIdentifier: string) {
  const [user, membership] = await Promise.all([
    getUserByTokenIdentifier(ctx, tokenIdentifier),
    getOrganizationMembershipForToken(ctx, organizationId, tokenIdentifier)
  ])

  if (!user || !membership) {
    throw createError('Organization member not found', 'not_found')
  }

  return buildLegacyMemberRecord(membership, user)
}

async function getOrganizationProjects(ctx: any, organizationId: any) {
  return await ctx.db.query('projects').withIndex('by_organization_id', (q: any) => q.eq('organizationId', organizationId)).collect()
}

async function getOrganizationPosts(ctx: any, organizationId: any) {
  return await ctx.db.query('posts').withIndex('by_organization_id', (q: any) => q.eq('organizationId', organizationId)).collect()
}

async function getOrganizationComments(ctx: any, organizationId: any) {
  return await ctx.db.query('comments').withIndex('by_organization_id', (q: any) => q.eq('organizationId', organizationId)).collect()
}

async function getOrganizationNotes(ctx: any, organizationId: any) {
  return await ctx.db.query('notes').withIndex('by_organization_id', (q: any) => q.eq('organizationId', organizationId)).collect()
}

async function getOrganizationCalls(ctx: any, organizationId: any) {
  return await ctx.db.query('calls').withIndex('by_organization_id', (q: any) => q.eq('organizationId', organizationId)).collect()
}

function getFallbackProject(projects: any[]) {
  const generalProject = projects.find((project: any) => project.isGeneral)

  if (!generalProject) {
    return defaultProject
  }

  return {
    id: generalProject._id,
    name: generalProject.name,
    accessory: generalProject.accessory ?? null,
    private: generalProject.private,
    archived: !!generalProject.archivedAt,
    message_thread_id: generalProject.messageThreadId ?? null
  }
}

function buildMiniProject(project: any, fallbackProject: typeof defaultProject) {
  if (!project) {
    return fallbackProject
  }

  return {
    id: project._id,
    name: project.name,
    accessory: project.accessory ?? null,
    private: project.private,
    archived: !!project.archivedAt,
    message_thread_id: project.messageThreadId ?? null
  }
}

function buildLegacyPublicOrganization(organization: any, viewerMembership: any) {
  const avatarUrl = buildLegacyMediaUrl(organization.avatarPath ?? organization.avatar_url)

  return {
    id: organization._id,
    avatar_url: avatarUrl || '',
    avatar_urls: buildLegacyAvatarUrls(avatarUrl),
    name: organization.name,
    slug: organization.slug,
    viewer_is_admin: viewerMembership.role === 'admin',
    viewer_can_leave: viewerMembership.role !== 'admin'
  }
}

function buildAttachmentTypeFlags(fileType: string) {
  const normalized = fileType.toLowerCase()

  return {
    link: normalized === 'link',
    image: normalized.startsWith('image/'),
    video: normalized.startsWith('video/'),
    audio: normalized.startsWith('audio/'),
    origami: normalized.includes('origami'),
    principle: normalized.includes('principle'),
    lottie: normalized.includes('lottie') || normalized.includes('json'),
    stitch: normalized.includes('stitch'),
    gif: normalized.includes('gif')
  }
}

function buildAttachmentImageUrls(attachment: any, flags: ReturnType<typeof buildAttachmentTypeFlags>) {
  if (!flags.image && !flags.gif) {
    return null
  }

  const originalUrl = buildLegacyMediaUrl(attachment.filePath)
  const previewUrl = buildLegacyMediaUrl(attachment.previewFilePath || attachment.filePath)

  return {
    original_url: originalUrl,
    thumbnail_url: previewUrl,
    feed_url: previewUrl,
    email_url: originalUrl,
    slack_url: previewUrl,
    large_url: originalUrl
  }
}

function pickSubjectThumbnailUrl(attachments: any[]) {
  for (const attachment of attachments) {
    const flags = buildAttachmentTypeFlags(attachment.fileType || '')

    if (flags.image || flags.gif || flags.video || flags.lottie) {
      return buildLegacyMediaUrl(attachment.previewFilePath || attachment.filePath)
    }
  }

  return null
}

async function hasPostIterations(ctx: any, postId: string) {
  const children = await ctx.db.query('posts').withIndex('by_parent_id', (q: any) => q.eq('parentId', postId as any)).collect()
  return children.length > 0
}

function buildLegacyAttachment(
  attachment: any,
  subjectType: 'Post' | 'Comment',
  subjectId: string,
  isSubjectComment: boolean
) {
  const url = attachment.previewFilePath || attachment.filePath
  const originalUrl = buildLegacyMediaUrl(attachment.filePath)
  const previewUrl = buildLegacyMediaUrl(attachment.previewFilePath || attachment.filePath)
  const flags = buildAttachmentTypeFlags(attachment.fileType)

  return {
    id: attachment.id,
    file_type: attachment.fileType,
    url: buildLegacyMediaUrl(url),
    app_url: originalUrl,
    download_url: originalUrl,
    preview_url: previewUrl,
    preview_thumbnail_url: previewUrl,
    image_urls: buildAttachmentImageUrls(attachment, flags),
    ...flags,
    duration: attachment.duration ?? 0,
    width: attachment.width ?? 0,
    height: attachment.height ?? 0,
    subject_type: subjectType,
    name: attachment.name ?? null,
    size: attachment.size ?? null,
    remote_figma_url: null,
    no_video_track: attachment.noVideoTrack ?? false,
    gallery_id: attachment.galleryId ?? null,
    type_name: 'attachment',
    subject_id: subjectId,
    is_subject_comment: isSubjectComment,
    relative_url: attachment.filePath,
    preview_relative_url: attachment.previewFilePath ?? null,
    comments_count: 0,
    key: attachment.filePath,
    optimistic_ready: true
  }
}

async function buildPreviewCommenters(ctx: any, organizationId: any, comments: any[]) {
  const latestUniqueComments = [...comments]
    .sort((a: any, b: any) => b.createdAt - a.createdAt)
    .filter(
      (comment: any, index: number, list: any[]) =>
        list.findIndex((other: any) => other.authorTokenIdentifier === comment.authorTokenIdentifier) === index
    )
    .slice(0, 3)

  return {
    latest_commenters: await Promise.all(
      latestUniqueComments.map((comment: any) => buildLegacyMember(ctx, organizationId, comment.authorTokenIdentifier))
    )
  }
}

async function buildSearchPost(ctx: any, params: { organizationId: any; post: any; project: any; fallbackProject: typeof defaultProject }) {
  const author = await buildLegacyMember(ctx, params.organizationId, params.post.authorTokenIdentifier)
  const thumbnailUrl = pickSubjectThumbnailUrl(params.post.attachments ?? [])

  return {
    id: params.post._id,
    title: params.post.title,
    description_html: params.post.descriptionHtml,
    truncated_description_text: stripHtml(params.post.descriptionHtml),
    created_at: new Date(params.post.createdAt).toISOString(),
    published_at: formatDate(params.post.publishedAt),
    thumbnail_url: thumbnailUrl,
    member: author,
    project: buildMiniProject(params.project, params.fallbackProject)
  }
}

async function buildLegacyPost(
  ctx: any,
  params: {
    organization: any
    viewerMembership: any
    viewerTokenIdentifier: string
    post: any
    project: any
    fallbackProject: typeof defaultProject
    comments: any[]
  }
) {
  const { organization, viewerMembership, viewerTokenIdentifier, post, project, fallbackProject, comments } = params
  const author = await buildLegacyMember(ctx, organization._id, post.authorTokenIdentifier)
  const previewCommenters = await buildPreviewCommenters(ctx, organization._id, comments)
  const latestComment = [...comments].sort((a: any, b: any) => b.createdAt - a.createdAt)[0]
  const latestCommentMember =
    latestComment ? await buildLegacyMember(ctx, organization._id, latestComment.authorTokenIdentifier) : null
  const viewerHasCommented = comments.some((comment: any) => comment.authorTokenIdentifier === viewerTokenIdentifier)
  const resolvedCommentsCount = comments.filter((comment: any) => !!comment.resolvedAt).length
  const path = `/${organization.slug}/posts/${post._id}`
  const descriptionText = stripHtml(post.descriptionHtml)
  const thumbnailUrl = pickSubjectThumbnailUrl(post.attachments ?? [])
  const [groupedReactions, followUps, viewerHasFavorited, viewerHasSubscribed, hasIterations] = await Promise.all([
    buildLegacyGroupedReactions(ctx, {
      organizationId: organization._id,
      subjectType: 'Post',
      subjectId: post._id,
      viewerTokenIdentifier
    }),
    buildLegacySubjectFollowUps(ctx, {
      organizationId: organization._id,
      subjectType: 'Post',
      subjectId: post._id,
      viewerTokenIdentifier
    }),
    hasLegacyFavorite(ctx, {
      organizationId: organization._id,
      tokenIdentifier: viewerTokenIdentifier,
      favoritableType: 'Post',
      favoritableId: post._id
    }),
    hasLegacyPostSubscription(ctx, {
      organizationId: organization._id,
      tokenIdentifier: viewerTokenIdentifier,
      postId: post._id
    }),
    hasPostIterations(ctx, post._id)
  ])

  return {
    id: post._id,
    title: post.title,
    is_title_from_description: !post.title,
    created_at: new Date(post.createdAt).toISOString(),
    published_at: formatDate(post.publishedAt),
    published: !post.draft,
    last_activity_at: new Date(post.lastActivityAt).toISOString(),
    comments_count: comments.length,
    resolved_comments_count: resolvedCommentsCount,
    version: typeof post.version === 'number' ? post.version : 1,
    path,
    channel_name: `post-${post._id}`,
    views_count: 0,
    non_member_views_count: 0,
    status: post.status,
    visibility: post.visibility,
    open_graph_image_url: thumbnailUrl,
    thumbnail_url: thumbnailUrl,
    unfurled_link: post.unfurledLink ?? null,
    description_html: post.descriptionHtml,
    truncated_description_html: post.descriptionHtml,
    is_text_content_truncated: false,
    truncated_description_text: descriptionText,
    url: path,
    type_name: 'post',
    organization: buildLegacyPublicOrganization(organization, viewerMembership),
    attachments: post.attachments.map((attachment: any) => buildLegacyAttachment(attachment, 'Post', post._id, false)),
    links: post.links,
    tags: [],
    poll: null,
    feedback_requests: null,
    follow_ups: followUps,
    member: author,
    resolved_comment: null,
    grouped_reactions: groupedReactions,
    project: buildMiniProject(project, fallbackProject),
    has_parent: !!post.parentId,
    has_iterations: hasIterations,
    viewer_is_organization_member: true,
    viewer_is_author: post.authorTokenIdentifier === viewerTokenIdentifier,
    viewer_has_commented: viewerHasCommented,
    preview_commenters: previewCommenters,
    viewer_feedback_status: 'none',
    viewer_has_subscribed: viewerHasSubscribed || post.authorTokenIdentifier === viewerTokenIdentifier || viewerHasCommented,
    viewer_has_viewed: true,
    viewer_has_favorited: viewerHasFavorited,
    unseen_comments_count: 0,
    viewer_can_resolve: true,
    viewer_can_favorite: true,
    viewer_can_edit: post.authorTokenIdentifier === viewerTokenIdentifier,
    viewer_can_delete: post.authorTokenIdentifier === viewerTokenIdentifier,
    viewer_can_create_issue: true,
    resolution: null,
    latest_comment_preview:
      latestComment && latestCommentMember
        ? `${latestCommentMember.user.display_name}: ${stripHtml(latestComment.bodyHtml)}`
        : null,
    latest_comment_path: latestComment ? `${path}#comment-${latestComment._id}` : null,
    viewer_is_latest_comment_author: latestComment
      ? latestComment.authorTokenIdentifier === viewerTokenIdentifier
      : false,
    project_pin_id: null,
    resource_mentions: await getLegacyResourceMentionsFromHtml(ctx, {
      organizationId: organization._id,
      organizationSlug: organization.slug,
      html: post.descriptionHtml
    })
  }
}

function buildMixedResult(params: {
  post: any
  project: any
  author: any
  tokens: string[]
  fallbackProject: typeof defaultProject
}) {
  const title = params.post.title || ''
  const descriptionText = stripHtml(params.post.descriptionHtml)
  const projectName = params.project?.name || params.fallbackProject.name
  const authorName = params.author?.displayName || ''
  const authorUsername = params.author?.username || ''
  const combinedText = [title, descriptionText, projectName, authorName, authorUsername].join(' ')

  if (!matchesAllTokens(combinedText, params.tokens)) {
    return null
  }

  const titleHighlight = highlightValue(title, params.tokens)
  const descriptionHighlight = buildExcerptHighlight(descriptionText, params.tokens)
  const projectHighlight = highlightValue(projectName, params.tokens)
  const authorHighlight = highlightValue(authorName || authorUsername, params.tokens)

  const highlights = [descriptionHighlight]

  if (projectHighlight) {
    highlights.push(`Project: ${projectHighlight}`)
  }

  if (authorHighlight) {
    highlights.push(`Author: ${authorHighlight}`)
  }

  const score =
    scoreTextMatch(title, params.tokens, { exact: 600, prefix: 450, include: 300 }) +
    scoreTextMatch(projectName, params.tokens, { exact: 250, prefix: 200, include: 150 }) +
    scoreTextMatch(authorName || authorUsername, params.tokens, { exact: 220, prefix: 180, include: 140 }) +
    scoreTextMatch(descriptionText, params.tokens, { exact: 180, prefix: 140, include: 100 })

  return {
    score,
    item: {
      id: params.post._id,
      type: 'post' as const,
      highlights: highlights.filter((value): value is string => !!value),
      title_highlight: titleHighlight
    }
  }
}

function sortByScoreAndDate<T extends { score: number; createdAt: number }>(results: T[]) {
  return [...results].sort((left, right) => {
    if (right.score !== left.score) {
      return right.score - left.score
    }

    return right.createdAt - left.createdAt
  })
}

export const getLegacySearchMixed = query({
  args: {
    slug: v.string(),
    q: v.string(),
    focus: v.optional(v.union(v.literal('posts'), v.literal('calls'), v.literal('notes')))
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)

    if (!context) {
      throw createError('Organization not found', 'not_found')
    }

    if (args.focus === 'calls' || args.focus === 'notes') {
      return {
        items: [],
        posts: [],
        calls: [],
        notes: []
      }
    }

    const tokens = tokenizeQuery(args.q)

    if (!tokens.length) {
      return {
        items: [],
        posts: [],
        calls: [],
        notes: []
      }
    }

    const [posts, projects] = await Promise.all([
      getOrganizationPosts(ctx, context.organization._id),
      getOrganizationProjects(ctx, context.organization._id)
    ])
    const fallbackProject = getFallbackProject(projects)
    const projectsById = new Map<string, any>(projects.map((project: any) => [project._id, project]))

    const matches = []

    for (const post of posts) {
      const project = post.projectId ? projectsById.get(post.projectId) ?? null : null
      const author = await getUserByTokenIdentifier(ctx, post.authorTokenIdentifier)

      if (!author) {
        continue
      }

      const mixedResult = buildMixedResult({
        post,
        project,
        author,
        tokens,
        fallbackProject
      })

      if (!mixedResult) {
        continue
      }

      matches.push({
        score: mixedResult.score,
        createdAt: post.publishedAt ?? post.createdAt,
        post,
        project,
        item: mixedResult.item
      })
    }

    const sorted = sortByScoreAndDate(matches).slice(0, MAX_MIXED_RESULTS)
    const searchPosts = await Promise.all(
      sorted.map(({ post, project }) =>
        buildSearchPost(ctx, {
          organizationId: context.organization._id,
          post,
          project,
          fallbackProject
        })
      )
    )

    return {
      items: sorted.map(({ item }) => item),
      posts: searchPosts,
      calls: [],
      notes: []
    }
  }
})

export const getLegacySearchPosts = query({
  args: {
    slug: v.string(),
    q: v.string(),
    project_id: v.optional(v.string()),
    author: v.optional(v.string()),
    tag: v.optional(v.string()),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)

    if (!context) {
      throw createError('Organization not found', 'not_found')
    }

    const tokens = tokenizeQuery(args.q || args.tag || '')
    const authorFilter = normalizeText(args.author?.replace(/^@/, ''))
    const limit = Math.max(1, Math.min(args.limit ?? DEFAULT_POST_RESULTS, MAX_POST_RESULTS))
    const [posts, projects, comments] = await Promise.all([
      getOrganizationPosts(ctx, context.organization._id),
      getOrganizationProjects(ctx, context.organization._id),
      getOrganizationComments(ctx, context.organization._id)
    ])
    const fallbackProject = getFallbackProject(projects)
    const projectsById = new Map<string, any>(projects.map((project: any) => [project._id, project]))
    const commentsByPostId = new Map<string, any[]>()

    for (const comment of comments) {
      const bucket = commentsByPostId.get(comment.postId) ?? []
      bucket.push(comment)
      commentsByPostId.set(comment.postId, bucket)
    }

    const matches = []

    for (const post of posts) {
      if (args.project_id && post.projectId !== args.project_id) {
        continue
      }

      const [author, authorMembership] = await Promise.all([
        getUserByTokenIdentifier(ctx, post.authorTokenIdentifier),
        getOrganizationMembershipForToken(ctx, context.organization._id, post.authorTokenIdentifier)
      ])

      if (!author || !authorMembership) {
        continue
      }

      if (authorFilter) {
        const matchesAuthor =
          normalizeText(author.username) === authorFilter || normalizeText(author.displayName) === authorFilter

        if (!matchesAuthor) {
          continue
        }
      }

      const project = post.projectId ? projectsById.get(post.projectId) ?? null : null
      const searchText = [
        post.title,
        stripHtml(post.descriptionHtml),
        project?.name || fallbackProject.name,
        author.displayName,
        author.username
      ].join(' ')

      if (tokens.length > 0 && !matchesAllTokens(searchText, tokens)) {
        continue
      }

      const score =
        scoreTextMatch(post.title, tokens, { exact: 500, prefix: 360, include: 220 }) +
        scoreTextMatch(stripHtml(post.descriptionHtml), tokens, { exact: 180, prefix: 140, include: 100 }) +
        scoreTextMatch(project?.name || fallbackProject.name, tokens, { exact: 160, prefix: 120, include: 90 }) +
        scoreTextMatch(author.displayName, tokens, { exact: 140, prefix: 110, include: 80 })

      matches.push({
        score,
        createdAt: post.lastActivityAt,
        post,
        project
      })
    }

    const sorted = sortByScoreAndDate(matches).slice(0, limit)

    return await Promise.all(
      sorted.map(({ post, project }) =>
        buildLegacyPost(ctx, {
          organization: context.organization,
          viewerMembership: context.viewerMembership,
          viewerTokenIdentifier: context.identity.tokenIdentifier,
          post,
          project,
          fallbackProject,
          comments: commentsByPostId.get(post._id) ?? []
        })
      )
    )
  }
})

export const getLegacySearchResourceMentions = query({
  args: {
    slug: v.string(),
    q: v.string()
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)

    if (!context) {
      throw createError('Organization not found', 'not_found')
    }

    const tokens = tokenizeQuery(args.q)

    if (!tokens.length) {
      return { items: [] }
    }

    const [posts, projects, notes, calls] = await Promise.all([
      getOrganizationPosts(ctx, context.organization._id),
      getOrganizationProjects(ctx, context.organization._id),
      getOrganizationNotes(ctx, context.organization._id),
      getOrganizationCalls(ctx, context.organization._id)
    ])
    const fallbackProject = getFallbackProject(projects)
    const projectsById = new Map<string, any>(projects.map((project: any) => [project._id, project]))
    const matches = []

    for (const post of posts) {
      const author = await getUserByTokenIdentifier(ctx, post.authorTokenIdentifier)
      const project = post.projectId ? projectsById.get(post.projectId) ?? null : null
      const searchableText = [
        post.title,
        stripHtml(post.descriptionHtml),
        project?.name || fallbackProject.name,
        author?.displayName || '',
        author?.username || ''
      ].join(' ')

      if (!matchesAllTokens(searchableText, tokens)) {
        continue
      }

      const score =
        scoreTextMatch(post.title, tokens, { exact: 500, prefix: 360, include: 220 }) +
        scoreTextMatch(stripHtml(post.descriptionHtml), tokens, { exact: 180, prefix: 140, include: 100 }) +
        scoreTextMatch(project?.name || fallbackProject.name, tokens, { exact: 180, prefix: 140, include: 100 })

      matches.push({
        score,
        createdAt: post.publishedAt ?? post.createdAt,
        type: 'post',
        post,
        project
      })
    }

    for (const note of notes) {
      const project = note.projectId ? projectsById.get(note.projectId) ?? null : null
      const searchableText = [note.title || '', stripHtml(note.descriptionHtml), project?.name || fallbackProject.name].join(' ')

      if (!matchesAllTokens(searchableText, tokens)) {
        continue
      }

      const score =
        scoreTextMatch(note.title || '', tokens, { exact: 500, prefix: 360, include: 220 }) +
        scoreTextMatch(stripHtml(note.descriptionHtml), tokens, { exact: 180, prefix: 140, include: 100 }) +
        scoreTextMatch(project?.name || fallbackProject.name, tokens, { exact: 180, prefix: 140, include: 100 })

      matches.push({
        score,
        createdAt: note.lastActivityAt ?? note.createdAt,
        type: 'note',
        note,
        project
      })
    }

    for (const call of calls) {
      const project = call.projectId ? projectsById.get(call.projectId) ?? null : null
      const searchableText = [call.title || '', stripHtml(call.summaryHtml), project?.name || fallbackProject.name].join(' ')

      if (!matchesAllTokens(searchableText, tokens)) {
        continue
      }

      const score =
        scoreTextMatch(call.title || '', tokens, { exact: 500, prefix: 360, include: 220 }) +
        scoreTextMatch(stripHtml(call.summaryHtml), tokens, { exact: 180, prefix: 140, include: 100 }) +
        scoreTextMatch(project?.name || fallbackProject.name, tokens, { exact: 180, prefix: 140, include: 100 })

      matches.push({
        score,
        createdAt: call.startedAt ?? call.createdAt,
        type: 'call',
        call,
        project
      })
    }

    const sorted = sortByScoreAndDate(matches).slice(0, MAX_MIXED_RESULTS)

    return {
      items: sorted.map((match) => ({
        item:
          match.type === 'note'
            ? buildNoteResourceMention(context.organization.slug, match.note)
            : match.type === 'call'
              ? buildCallResourceMention(context.organization.slug, match.call)
              : buildPostResourceMention(context.organization.slug, match.post),
        project: buildMiniProject(match.project, fallbackProject)
      }))
    }
  }
})

export const getLegacyResourceMentionByUrl = query({
  args: {
    slug: v.string(),
    url: v.string()
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)

    if (!context) {
      throw createError('Organization not found', 'not_found')
    }

    const mention = await resolveLegacyResourceMentionByUrl(ctx, {
      organizationId: context.organization._id,
      organizationSlug: context.organization.slug,
      url: args.url
    })

    if (!mention) {
      return { post: null, call: null, note: null, project: null }
    }

    return mention
  }
})
