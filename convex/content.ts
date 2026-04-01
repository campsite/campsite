import { v } from 'convex/values'

import { mutation, query } from './_generated/server'
import {
  buildLegacyGroupedReactions,
  buildLegacySubjectFollowUps,
  hasLegacyFavorite,
  hasLegacyPostSubscription
} from './engagement'
import { buildLegacyAvatarUrls, buildLegacyMediaUrl, buildLegacyMember as buildLegacyMemberRecord } from './legacy'
import { createSubjectAttachment, listSubjectAttachments, listSubjectViews, upsertSubjectView } from './media'
import { buildLegacyUnreadNotificationCounts, createNotificationRecord } from './notifications'
import {
  deleteTimelineEventsForSubject,
  discardActiveProjectPinsForSubject,
  getActiveProjectPinForSubject,
  getSharedTimelineEventsForSubject,
  paginateByCursor
} from './pinsBookmarks'
import { getProjectUnreadForViewer } from './projectViews'
import { getLegacyResourceMentionsFromHtml } from './resourceMentions'
import { buildWorkspaceState, generateToken } from './workspace'

const defaultProject = {
  id: 'general',
  name: 'General',
  accessory: null,
  private: false,
  archived: false,
  message_thread_id: null
}

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function truncateText(value: string, maxLength: number) {
  if (value.length <= maxLength) {
    return value
  }

  return `${value.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`
}

function toDescriptionHtml(description?: string, descriptionHtml?: string) {
  if (descriptionHtml && descriptionHtml.trim()) {
    return descriptionHtml
  }

  if (description && description.trim()) {
    return `<p>${description.trim()}</p>`
  }

  return '<p></p>'
}

function formatDate(timestamp?: number | null) {
  return timestamp ? new Date(timestamp).toISOString() : null
}

function createError(code: string, message: string) {
  return new Error(`${code}:${message}`)
}

function toGeneratedHtml(status: 'pending' | 'failed' | 'success', html: string | null, responseId: string | null = null) {
  return {
    status,
    html,
    response_id: responseId
  }
}

function normalizeTagName(name: string) {
  return name.trim()
}

function validateTagName(name: string) {
  if (name.length < 2 || name.length > 32) {
    throw createError('unprocessable', 'Tag name must be between 2 and 32 characters')
  }

  if (!/^[A-Za-z0-9][A-Za-z0-9-]*[A-Za-z0-9]$/.test(name)) {
    throw createError(
      'unprocessable',
      'Tag name can only contain alphanumeric characters or single hyphens, and cannot begin or end with a hyphen'
    )
  }
}

async function getOrganizationContext(ctx: any, slug: string) {
  const state = await buildWorkspaceState(ctx)
  const membershipEntry = state.memberships.find((entry: any) => entry.organization?.slug === slug)

  if (!membershipEntry?.organization) {
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

async function listOrganizationTags(ctx: any, organizationId: any) {
  const tags = await ctx.db
    .query('tags')
    .withIndex('by_organization_id', (q: any) => q.eq('organizationId', organizationId))
    .collect()

  return [...tags].sort((left: any, right: any) => left.name.localeCompare(right.name))
}

async function getTagByName(ctx: any, organizationId: any, tagName: string) {
  return await ctx.db
    .query('tags')
    .withIndex('by_organization_and_name', (q: any) => q.eq('organizationId', organizationId).eq('name', tagName))
    .unique()
}

async function listPostTaggingsForPost(ctx: any, postId: string) {
  return await ctx.db.query('postTaggings').withIndex('by_post_id', (q: any) => q.eq('postId', postId)).collect()
}

async function listPostTaggingsForTag(ctx: any, tagId: string) {
  return await ctx.db.query('postTaggings').withIndex('by_tag_id', (q: any) => q.eq('tagId', tagId)).collect()
}

async function countPostsForTag(ctx: any, tagId: string) {
  return (await listPostTaggingsForTag(ctx, tagId)).length
}

async function listLegacyTagsForPost(ctx: any, organization: any, viewerMembership: any, postId: string) {
  const taggings = await listPostTaggingsForPost(ctx, postId)
  const tags = await Promise.all(taggings.map((tagging: any) => ctx.db.get(tagging.tagId)))
  const validTags = tags.filter(Boolean)
  const counts = await Promise.all(validTags.map((tag: any) => countPostsForTag(ctx, tag._id)))

  return validTags
    .map((tag: any, index: number) => buildLegacyTag(tag, organization, counts[index] ?? 0, viewerMembership))
    .sort((left: any, right: any) => left.name.localeCompare(right.name))
}

async function replacePostTags(
  ctx: any,
  params: {
    organizationId: any
    postId: string
    tags?: string[]
  }
) {
  if (params.tags === undefined) {
    return
  }

  const requestedNames = Array.from(new Set(params.tags.map((tag) => normalizeTagName(tag)).filter(Boolean)))

  if (requestedNames.length > 10) {
    throw createError('unprocessable', 'Post can have a max of 10 tags')
  }

  requestedNames.forEach(validateTagName)

  const existingTaggings = await listPostTaggingsForPost(ctx, params.postId)
  const existingTags = await Promise.all(existingTaggings.map((tagging: any) => ctx.db.get(tagging.tagId)))
  const existingTaggingsByName = new Map<string, any>()

  existingTags.forEach((tag: any, index: number) => {
    if (tag) {
      existingTaggingsByName.set(tag.name, existingTaggings[index])
    }
  })

  for (const [name, tagging] of Array.from(existingTaggingsByName.entries())) {
    if (!requestedNames.includes(name)) {
      await ctx.db.delete(tagging._id)
    }
  }

  const now = Date.now()

  for (const name of requestedNames) {
    if (existingTaggingsByName.has(name)) {
      continue
    }

    let tag = await getTagByName(ctx, params.organizationId, name)

    if (!tag) {
      const tagId = await ctx.db.insert('tags', {
        organizationId: params.organizationId,
        name,
        createdAt: now
      })

      tag = await ctx.db.get(tagId)
    }

    if (!tag) {
      continue
    }

    const existingTagging = await ctx.db
      .query('postTaggings')
      .withIndex('by_post_and_tag', (q: any) => q.eq('postId', params.postId).eq('tagId', tag._id))
      .unique()

    if (!existingTagging) {
      await ctx.db.insert('postTaggings', {
        organizationId: params.organizationId,
        postId: params.postId,
        tagId: tag._id,
        createdAt: now
      })
    }
  }
}

async function deletePostTaggings(ctx: any, postId: string) {
  const taggings = await listPostTaggingsForPost(ctx, postId)

  for (const tagging of taggings) {
    await ctx.db.delete(tagging._id)
  }
}

async function buildLegacyMember(ctx: any, organizationId: any, tokenIdentifier: string) {
  const [user, membership] = await Promise.all([
    getUserByTokenIdentifier(ctx, tokenIdentifier),
    getOrganizationMembershipForToken(ctx, organizationId, tokenIdentifier)
  ])

  if (!user || !membership) {
    throw new Error('Organization member not found')
  }

  return buildLegacyMemberRecord(membership, user)
}

async function buildLegacyMemberByMembershipId(ctx: any, membershipId?: any | null) {
  if (!membershipId) {
    return null
  }

  const membership = await ctx.db.get(membershipId)

  if (!membership) {
    return null
  }

  const user = await getUserByTokenIdentifier(ctx, membership.userTokenIdentifier)

  if (!user) {
    return null
  }

  return buildLegacyMemberRecord(membership, user)
}

async function buildGeneratedPostResolutionHtml(
  ctx: any,
  params: {
    organizationId: any
    post: any
    commentId?: string | null
  }
) {
  if (params.post.resolvedHtml) {
    return params.post.resolvedHtml
  }

  const comments = await getPostComments(ctx, params.post._id)
  const targetComment = params.commentId
    ? comments.find((comment: any) => comment._id === params.commentId) ??
      (await getCommentById(ctx, params.organizationId, params.commentId))
    : null
  const latestComment = [...comments].sort((left: any, right: any) => right.createdAt - left.createdAt)[0] ?? null
  const chosenComment = targetComment ?? latestComment ?? null
  const chosenCommentAuthor = chosenComment
    ? await buildLegacyMember(ctx, params.organizationId, chosenComment.authorTokenIdentifier).catch(() => null)
    : null
  const chosenText = chosenComment ? stripHtml(chosenComment.bodyHtml) : stripHtml(params.post.descriptionHtml ?? '')

  if (!chosenText) {
    return null
  }

  const safeText = escapeHtml(truncateText(chosenText, 180))

  if (chosenCommentAuthor?.user?.display_name) {
    return `<ul><li>${escapeHtml(chosenCommentAuthor.user.display_name)} closed the loop on ${safeText.toLowerCase()}.</li></ul>`
  }

  return `<p>${safeText}</p>`
}

async function buildGeneratedPostTldrHtml(
  ctx: any,
  params: {
    organizationId: any
    post: any
  }
) {
  const comments = await getPostComments(ctx, params.post._id)
  const latestComment = [...comments].sort((left: any, right: any) => right.createdAt - left.createdAt)[0] ?? null
  const latestCommentAuthor = latestComment
    ? await buildLegacyMember(ctx, params.organizationId, latestComment.authorTokenIdentifier).catch(() => null)
    : null
  const bullets: string[] = []
  const title = params.post.title?.trim()
  const description = stripHtml(params.post.descriptionHtml ?? '')

  if (title) {
    bullets.push(`Topic: ${escapeHtml(truncateText(title, 90))}.`)
  }

  if (description) {
    bullets.push(escapeHtml(truncateText(description, 120)))
  }

  if (latestComment) {
    const latestCommentText = stripHtml(latestComment.bodyHtml)

    if (latestCommentText) {
      const prefix = latestCommentAuthor?.user?.display_name
        ? `${escapeHtml(latestCommentAuthor.user.display_name)} noted `
        : ''
      bullets.push(`${prefix}${escapeHtml(truncateText(latestCommentText, 110)).toLowerCase()}.`)
    }
  }

  if (params.post.projectId && params.post.projectId !== 'general') {
    const project = await ctx.db.get(params.post.projectId)

    if (project?.name) {
      bullets.push(`Project: ${escapeHtml(project.name)}.`)
    }
  }

  const uniqueBullets = Array.from(new Set(bullets.map((bullet) => bullet.trim()).filter(Boolean))).slice(0, 5)

  if (uniqueBullets.length === 0) {
    return null
  }

  if (uniqueBullets.length === 1) {
    return `<p>${uniqueBullets[0]}</p>`
  }

  return `<ul>${uniqueBullets.map((bullet) => `<li>${bullet}</li>`).join('')}</ul>`
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

function buildLegacyTag(tag: any, organization: any, postsCount: number, viewerMembership: any) {
  return {
    id: tag._id,
    name: tag.name,
    posts_count: postsCount,
    url: `/${organization.slug}/tags/${tag.name}`,
    viewer_can_destroy: viewerMembership.role === 'admin'
  }
}

function buildLegacyProject(project?: any | null, projectId?: string) {
  if (!project && !projectId) {
    return defaultProject
  }

  if (project) {
    return {
      ...defaultProject,
      id: project._id,
      name: project.name,
      accessory: project.accessory ?? null,
      private: project.private,
      archived: !!project.archivedAt,
      message_thread_id: project.messageThreadId ?? null
    }
  }

  return {
    ...defaultProject,
    id: projectId,
    name: 'Project'
  }
}

function pickAttachmentUrl(filePath: string, previewFilePath?: string) {
  return buildLegacyMediaUrl(previewFilePath || filePath)
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

function pickSubjectOpenGraphVideoUrl(attachments: any[]) {
  for (const attachment of attachments) {
    const flags = buildAttachmentTypeFlags(attachment.fileType || '')

    if (flags.video) {
      return buildLegacyMediaUrl(attachment.filePath)
    }
  }

  return null
}

function buildLegacyAttachment(
  attachment: any,
  subjectType: 'Post' | 'Comment',
  subjectId: string,
  isSubjectComment: boolean
) {
  const url = pickAttachmentUrl(attachment.filePath, attachment.previewFilePath)
  const originalUrl = buildLegacyMediaUrl(attachment.filePath)
  const previewUrl = buildLegacyMediaUrl(attachment.previewFilePath || attachment.filePath)
  const flags = buildAttachmentTypeFlags(attachment.fileType)
  const id = attachment.publicId ?? attachment.id
  const imageUrls = buildAttachmentImageUrls(attachment, flags)

  return {
    id,
    file_type: attachment.fileType,
    url,
    app_url: originalUrl,
    download_url: originalUrl,
    preview_url: previewUrl,
    preview_thumbnail_url: previewUrl,
    image_urls: imageUrls,
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

function buildLegacyPostViews(
  rows: any[],
  membersByTokenIdentifier: Map<string, any>,
  usersByTokenIdentifier: Map<string, any>,
  viewerTokenIdentifier?: string | null
) {
  return [...rows]
    .filter((row) => row.userTokenIdentifier !== viewerTokenIdentifier)
    .sort((left, right) => right.updatedAt - left.updatedAt)
    .map((row) => {
      const membership = membersByTokenIdentifier.get(row.userTokenIdentifier)
      const user = usersByTokenIdentifier.get(row.userTokenIdentifier)

      if (!membership || !user) {
        return null
      }

      return {
        id: row._id,
        updated_at: new Date(row.updatedAt).toISOString(),
        member: buildLegacyMemberRecord(membership, user)
      }
    })
    .filter(Boolean)
}

async function listDedicatedPostViews(ctx: any, postId: string) {
  return await ctx.db.query('postViews').withIndex('by_post_id', (q: any) => q.eq('postId', postId)).collect()
}

async function upsertDedicatedPostView(
  ctx: any,
  args: {
    organizationId: any
    postId: string
    organizationMembershipId?: any
    userTokenIdentifier?: string | null
    readAt?: number
    dwellTime?: number
  }
) {
  const now = Date.now()
  const byMembership =
    args.organizationMembershipId
      ? await ctx.db
          .query('postViews')
          .withIndex('by_post_and_membership', (q: any) =>
            q.eq('postId', args.postId).eq('organizationMembershipId', args.organizationMembershipId)
          )
          .unique()
      : null
  const byUser =
    !byMembership && args.userTokenIdentifier
      ? await ctx.db
          .query('postViews')
          .withIndex('by_post_and_user', (q: any) => q.eq('postId', args.postId).eq('userTokenIdentifier', args.userTokenIdentifier))
          .unique()
      : null
  const existing = byMembership ?? byUser

  if (existing) {
    await ctx.db.patch(existing._id, {
      organizationMembershipId: args.organizationMembershipId ?? existing.organizationMembershipId,
      userTokenIdentifier: args.userTokenIdentifier ?? existing.userTokenIdentifier,
      readAt: args.readAt ?? existing.readAt,
      dwellTimeTotal: (existing.dwellTimeTotal ?? 0) + Math.max(0, args.dwellTime ?? 0),
      readsCount: (existing.readsCount ?? 0) + (args.readAt ? 1 : 0),
      updatedAt: now
    })
    return await ctx.db.get(existing._id)
  }

  const rowId = await ctx.db.insert('postViews', {
    organizationId: args.organizationId,
    publicId: generateToken(),
    postId: args.postId,
    organizationMembershipId: args.organizationMembershipId,
    userTokenIdentifier: args.userTokenIdentifier ?? undefined,
    readAt: args.readAt,
    dwellTimeTotal: Math.max(0, args.dwellTime ?? 0),
    readsCount: args.readAt ? 1 : 0,
    createdAt: now,
    updatedAt: now
  })

  return await ctx.db.get(rowId)
}

async function recordNonMemberPostView(
  ctx: any,
  args: {
    organizationId: any
    postId: string
    userTokenIdentifier?: string | null
    anonymizedIp: string
    userAgent?: string | null
  }
) {
  const existing = await ctx.db
    .query('nonMemberPostViews')
    .withIndex('by_post_and_ip_agent', (q: any) =>
      q.eq('postId', args.postId).eq('anonymizedIp', args.anonymizedIp).eq('userAgent', args.userAgent ?? undefined)
    )
    .unique()
  const now = Date.now()

  if (existing) {
    await ctx.db.patch(existing._id, {
      userTokenIdentifier: args.userTokenIdentifier ?? existing.userTokenIdentifier,
      updatedAt: now
    })
    return await ctx.db.get(existing._id)
  }

  const rowId = await ctx.db.insert('nonMemberPostViews', {
    organizationId: args.organizationId,
    postId: args.postId,
    userTokenIdentifier: args.userTokenIdentifier ?? undefined,
    anonymizedIp: args.anonymizedIp,
    userAgent: args.userAgent ?? undefined,
    createdAt: now,
    updatedAt: now
  })

  return await ctx.db.get(rowId)
}

function getLinkHostLabel(url: string) {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, '')
    const [first] = hostname.split('.')
    return first ? first.charAt(0).toUpperCase() + first.slice(1) : hostname
  } catch {
    return 'Link'
  }
}

async function upsertOpenGraphLinkRecord(
  ctx: any,
  args: {
    url: string
    title?: string | null
    imagePath?: string | null
    faviconPath?: string | null
  }
) {
  const existing = await ctx.db.query('openGraphLinks').withIndex('by_url', (q: any) => q.eq('url', args.url)).unique()
  const now = Date.now()
  const title = args.title?.trim() || getLinkHostLabel(args.url)

  if (existing) {
    await ctx.db.patch(existing._id, {
      title,
      imagePath: args.imagePath ?? existing.imagePath,
      faviconPath: args.faviconPath ?? existing.faviconPath,
      updatedAt: now
    })
    return await ctx.db.get(existing._id)
  }

  const rowId = await ctx.db.insert('openGraphLinks', {
    url: args.url,
    title,
    imagePath: args.imagePath ?? undefined,
    faviconPath: args.faviconPath ?? undefined,
    createdAt: now,
    updatedAt: now
  })

  return await ctx.db.get(rowId)
}

async function listStoredPostLinks(ctx: any, postId: string) {
  return await ctx.db.query('postLinks').withIndex('by_post_id', (q: any) => q.eq('postId', postId)).collect()
}

async function listStoredPostLinkPreviews(ctx: any, postId: string) {
  return await ctx.db.query('postLinkPreviews').withIndex('by_post_id', (q: any) => q.eq('postId', postId)).collect()
}

async function syncPostLinksAndPreviews(
  ctx: any,
  args: {
    organizationId: any
    postId: any
    links: { name: string; url: string }[]
    unfurledLink?: string | null
  }
) {
  const [existingLinks, existingPreviews] = await Promise.all([
    listStoredPostLinks(ctx, args.postId),
    listStoredPostLinkPreviews(ctx, args.postId)
  ])

  for (const row of existingLinks) {
    await ctx.db.delete(row._id)
  }

  for (const row of existingPreviews) {
    await ctx.db.delete(row._id)
  }

  const now = Date.now()

  for (const link of args.links) {
    await ctx.db.insert('postLinks', {
      organizationId: args.organizationId,
      publicId: generateToken(),
      postId: args.postId,
      url: link.url,
      name: link.name,
      createdAt: now,
      updatedAt: now
    })
  }

  if (args.unfurledLink) {
    const og = await upsertOpenGraphLinkRecord(ctx, {
      url: args.unfurledLink
    })

    await ctx.db.insert('postLinkPreviews', {
      organizationId: args.organizationId,
      publicId: generateToken(),
      postId: args.postId,
      url: args.unfurledLink,
      title: og?.title ?? getLinkHostLabel(args.unfurledLink),
      description: undefined,
      imageUrl: og?.imagePath ? buildLegacyMediaUrl(og.imagePath) ?? og.imagePath : undefined,
      videoUrl: undefined,
      serviceLogo: og?.faviconPath ? buildLegacyMediaUrl(og.faviconPath) ?? og.faviconPath : undefined,
      serviceName: getLinkHostLabel(args.unfurledLink),
      preview: true,
      createdAt: now,
      updatedAt: now
    })
  }
}

async function syncPostHierarchyRows(
  ctx: any,
  args: {
    organizationId: any
    postId: any
    parentId?: any
  }
) {
  const existingRows = await ctx.db
    .query('postHierarchies')
    .withIndex('by_descendant_id', (q: any) => q.eq('descendantPostId', args.postId))
    .collect()

  for (const row of existingRows) {
    await ctx.db.delete(row._id)
  }

  await ctx.db.insert('postHierarchies', {
    organizationId: args.organizationId,
    ancestorPostId: args.postId,
    descendantPostId: args.postId,
    generations: 0
  })

  if (!args.parentId) {
    return
  }

  const parentAncestors = await ctx.db
    .query('postHierarchies')
    .withIndex('by_descendant_id', (q: any) => q.eq('descendantPostId', args.parentId))
    .collect()

  if (parentAncestors.length === 0) {
    await ctx.db.insert('postHierarchies', {
      organizationId: args.organizationId,
      ancestorPostId: args.parentId,
      descendantPostId: args.postId,
      generations: 1
    })
    return
  }

  for (const ancestor of parentAncestors) {
    await ctx.db.insert('postHierarchies', {
      organizationId: args.organizationId,
      ancestorPostId: ancestor.ancestorPostId,
      descendantPostId: args.postId,
      generations: (ancestor.generations ?? 0) + 1
    })
  }
}

async function deletePostHierarchyRows(ctx: any, postId: any) {
  const [asAncestor, asDescendant] = await Promise.all([
    ctx.db.query('postHierarchies').withIndex('by_ancestor_id', (q: any) => q.eq('ancestorPostId', postId)).collect(),
    ctx.db.query('postHierarchies').withIndex('by_descendant_id', (q: any) => q.eq('descendantPostId', postId)).collect()
  ])

  for (const row of [...asAncestor, ...asDescendant]) {
    await ctx.db.delete(row._id)
  }
}

async function getPostById(ctx: any, organizationId: any, postId: string) {
  const posts = await ctx.db.query('posts').withIndex('by_organization_id', (q: any) => q.eq('organizationId', organizationId)).collect()

  return posts.find((post: any) => post._id === postId) ?? null
}

async function getPostVersionNumber(ctx: any, organizationId: any, post: any) {
  if (typeof post.version === 'number' && Number.isFinite(post.version)) {
    return post.version
  }

  let version = 1
  let current = post

  while (current?.parentId) {
    const parent = await getPostById(ctx, organizationId, current.parentId)

    if (!parent) {
      break
    }

    version += 1
    current = parent
  }

  return version
}

async function getPostVersionRoot(ctx: any, organizationId: any, post: any) {
  if (post.rootPostId) {
    const rootPost = await getPostById(ctx, organizationId, post.rootPostId)

    if (rootPost) {
      return rootPost
    }
  }

  let current = post

  while (current?.parentId) {
    const parent = await getPostById(ctx, organizationId, current.parentId)

    if (!parent) {
      break
    }

    current = parent
  }

  return current
}

async function listPostVersionChain(ctx: any, organizationId: any, post: any) {
  const root = await getPostVersionRoot(ctx, organizationId, post)
  const rootedPosts = await ctx.db
    .query('posts')
    .withIndex('by_root_post_id', (q: any) => q.eq('rootPostId', root._id as any))
    .collect()
  let connectedPosts = Array.from(new Map([root, ...rootedPosts].map((entry: any) => [entry._id, entry])).values())

  if (rootedPosts.length === 0) {
    const queue = [root]
    const visited = new Set<string>()
    const fallbackPosts: any[] = []

    while (queue.length > 0) {
      const current = queue.shift()

      if (!current || visited.has(current._id)) {
        continue
      }

      visited.add(current._id)
      fallbackPosts.push(current)

      const children = await ctx.db
        .query('posts')
        .withIndex('by_parent_id', (q: any) => q.eq('parentId', current._id as any))
        .collect()

      children.sort((left: any, right: any) => {
        return left.createdAt - right.createdAt || String(left._id).localeCompare(String(right._id))
      })

      queue.push(...children)
    }

    connectedPosts = fallbackPosts
  }

  return connectedPosts.sort((left: any, right: any) => {
    const leftVersion = typeof left.version === 'number' ? left.version : 1
    const rightVersion = typeof right.version === 'number' ? right.version : 1

    return leftVersion - rightVersion || left.createdAt - right.createdAt || String(left._id).localeCompare(String(right._id))
  })
}

async function hasPostIterations(ctx: any, postId: string) {
  const post = await ctx.db.get(postId as any)

  if (!post) {
    return false
  }

  const currentVersion = await getPostVersionNumber(ctx, post.organizationId, post)
  const versions = await listPostVersionChain(ctx, post.organizationId, post)

  return versions.some((entry: any) => {
    const candidateVersion = typeof entry.version === 'number' ? entry.version : 1
    return candidateVersion > currentVersion
  })
}

async function getCommentById(ctx: any, organizationId: any, commentId: string) {
  const comments = await ctx.db
    .query('comments')
    .withIndex('by_organization_id', (q: any) => q.eq('organizationId', organizationId))
    .collect()

  return comments.find((comment: any) => comment._id === commentId) ?? null
}

async function getNoteRowByPublicId(ctx: any, noteId: string) {
  return await ctx.db
    .query('notes')
    .withIndex('by_public_id', (query: any) => query.eq('publicId', noteId))
    .unique()
}

async function ensureNoteSubscription(ctx: any, organizationId: any, tokenIdentifier: string, noteId: string) {
  const existing = await ctx.db
    .query('subscriptions')
    .withIndex('by_organization_user_and_subject', (query: any) =>
      query
        .eq('organizationId', organizationId)
        .eq('userTokenIdentifier', tokenIdentifier)
        .eq('subscribableType', 'Note')
        .eq('subscribableId', noteId)
    )
    .unique()

  if (existing) {
    return existing
  }

  const id = await ctx.db.insert('subscriptions', {
    organizationId,
    userTokenIdentifier: tokenIdentifier,
    subscribableType: 'Note',
    subscribableId: noteId,
    createdAt: Date.now()
  })

  return await ctx.db.get(id)
}

async function getNoteSubscriptions(ctx: any, noteId: string) {
  return await ctx.db
    .query('subscriptions')
    .withIndex('by_subject', (query: any) => query.eq('subscribableType', 'Note').eq('subscribableId', noteId))
    .collect()
}

async function getPostComments(ctx: any, postId: string) {
  return await ctx.db.query('comments').withIndex('by_post_id', (q: any) => q.eq('postId', postId)).collect()
}

function collectCommentDescendantIds(comments: any[], rootCommentId: any) {
  const childrenByParent = new Map<any, any[]>()

  for (const comment of comments) {
    if (!comment.parentCommentId) {
      continue
    }

    const siblings = childrenByParent.get(comment.parentCommentId) ?? []
    siblings.push(comment)
    childrenByParent.set(comment.parentCommentId, siblings)
  }

  const queue: any[] = [rootCommentId]
  const targetIds: any[] = []

  while (queue.length > 0) {
    const currentId = queue.shift()

    if (!currentId || targetIds.includes(currentId)) {
      continue
    }

    targetIds.push(currentId)

    for (const child of childrenByParent.get(currentId) ?? []) {
      queue.push(child._id)
    }
  }

  return targetIds
}

async function getPostPoll(ctx: any, postId: string) {
  return await ctx.db
    .query('polls')
    .withIndex('by_post_id', (query: any) => query.eq('postId', postId))
    .unique()
}

async function listPollOptions(ctx: any, pollId: string) {
  const rows = await ctx.db
    .query('pollOptions')
    .withIndex('by_poll_id', (query: any) => query.eq('pollId', pollId))
    .collect()

  return [...rows].sort((left, right) => left.position - right.position || left.createdAt - right.createdAt)
}

async function getPollOptionByPublicId(ctx: any, publicId: string) {
  return await ctx.db
    .query('pollOptions')
    .withIndex('by_public_id', (query: any) => query.eq('publicId', publicId))
    .unique()
}

async function listPollVotes(ctx: any, pollId: string) {
  return await ctx.db
    .query('pollVotes')
    .withIndex('by_poll_id', (query: any) => query.eq('pollId', pollId))
    .collect()
}

async function listActivePostFeedbackRequests(ctx: any, postId: string) {
  const rows = await ctx.db
    .query('postFeedbackRequests')
    .withIndex('by_post_id', (query: any) => query.eq('postId', postId))
    .collect()

  return rows.filter((row: any) => !row.discardedAt && !row.dismissedAt)
}

async function getPostFeedbackRequestByPublicId(ctx: any, publicId: string) {
  return await ctx.db
    .query('postFeedbackRequests')
    .withIndex('by_public_id', (query: any) => query.eq('publicId', publicId))
    .unique()
}

function buildLegacyPoll(poll: any, options: any[], votes: any[], viewerTokenIdentifier?: string | null) {
  const votesByOptionId = new Map<string, number>()
  const viewerVotedOptionIds = new Set<string>()

  for (const vote of votes) {
    votesByOptionId.set(vote.pollOptionId, (votesByOptionId.get(vote.pollOptionId) ?? 0) + 1)

    if (vote.userTokenIdentifier === viewerTokenIdentifier) {
      viewerVotedOptionIds.add(vote.pollOptionId)
    }
  }

  const votesCount = votes.length

  return {
    id: poll.publicId,
    description: poll.description,
    votes_count: votesCount,
    options: options.map((option: any) => {
      const optionVotesCount = votesByOptionId.get(option._id) ?? 0

      return {
        id: option.publicId,
        description: option.description,
        votes_count: optionVotesCount,
        votes_percent: votesCount > 0 ? Math.round((optionVotesCount / votesCount) * 100) : 0,
        viewer_voted: viewerVotedOptionIds.has(option._id)
      }
    }),
    viewer_voted: viewerVotedOptionIds.size > 0
  }
}

function buildLegacyFeedbackRequests(
  rows: any[],
  membershipsById: Map<string, any>,
  usersByTokenIdentifier: Map<string, any>
) {
  return rows
    .map((row: any) => {
      const membership = membershipsById.get(row.organizationMembershipId)
      const user = usersByTokenIdentifier.get(row.userTokenIdentifier)

      if (!membership || !user) {
        return null
      }

      return {
        id: row.publicId,
        has_replied: !!row.hasReplied,
        member: buildLegacyMemberRecord(membership, user)
      }
    })
    .filter(Boolean)
}

function buildViewerFeedbackStatus(feedbackRequestRows: any[], viewerTokenIdentifier?: string | null) {
  if (!viewerTokenIdentifier) {
    return 'none' as const
  }

  const viewerRequest = feedbackRequestRows.find((row: any) => row.userTokenIdentifier === viewerTokenIdentifier)

  if (viewerRequest && !viewerRequest.hasReplied) {
    return 'viewer_requested' as const
  }

  if (feedbackRequestRows.some((row: any) => !row.hasReplied)) {
    return 'open' as const
  }

  return 'none' as const
}

async function replacePostFeedbackRequests(
  ctx: any,
  params: {
    organizationId: any
    postId: string
    memberIds: string[]
    actorTokenIdentifier: string
    targetTitle: string
    targetProjectId?: string
  }
) {
  const requestedMemberIds = new Set(params.memberIds)
  const now = Date.now()
  const existingRows = await ctx.db
    .query('postFeedbackRequests')
    .withIndex('by_post_id', (query: any) => query.eq('postId', params.postId))
    .collect()

  for (const row of existingRows) {
    const stillRequested = requestedMemberIds.has(row.organizationMembershipId)

    if (!stillRequested && !row.discardedAt) {
      await ctx.db.patch(row._id, {
        discardedAt: now,
        updatedAt: now
      })
    }
  }

  for (const memberId of Array.from(requestedMemberIds)) {
    const membership = await ctx.db.get(memberId as any)

    if (!membership || membership.organizationId !== params.organizationId || membership.discardedAt) {
      continue
    }

    const existing = existingRows.find((row: any) => row.organizationMembershipId === memberId)
    const shouldNotify =
      !existing || !!existing.discardedAt || !!existing.dismissedAt || !!existing.hasReplied

    if (existing) {
      await ctx.db.patch(existing._id, {
        hasReplied: false,
        discardedAt: undefined,
        dismissedAt: undefined,
        updatedAt: now
      })
    } else {
      await ctx.db.insert('postFeedbackRequests', {
        organizationId: params.organizationId,
        postId: params.postId as any,
        publicId: generateToken(),
        organizationMembershipId: memberId as any,
        userTokenIdentifier: membership.userTokenIdentifier,
        hasReplied: false,
        createdAt: now,
        updatedAt: now
      })
    }

    if (shouldNotify) {
      await createNotificationRecord(ctx, {
        organizationId: params.organizationId,
        recipientTokenIdentifier: membership.userTokenIdentifier,
        actorTokenIdentifier: params.actorTokenIdentifier,
        reason: 'feedback_requested',
        inboxKey: `post:${params.postId}:feedback_request:${membership.userTokenIdentifier}`,
        subjectType: 'Post',
        subjectId: params.postId,
        subjectTitle: params.targetTitle,
        targetType: 'Post',
        targetId: params.postId,
        targetTitle: params.targetTitle,
        targetProjectId: params.targetProjectId,
        bodyPreviewPrefix: 'Requested feedback on',
        bodyPreview: params.targetTitle
      })
    }
  }
}

async function markPostFeedbackRequestReplied(
  ctx: any,
  params: {
    postId: string
    userTokenIdentifier: string
  }
) {
  const existing = await ctx.db
    .query('postFeedbackRequests')
    .withIndex('by_post_and_user', (query: any) =>
      query.eq('postId', params.postId).eq('userTokenIdentifier', params.userTokenIdentifier)
    )
    .collect()

  const now = Date.now()

  for (const row of existing) {
    if (!row.discardedAt && !row.hasReplied) {
      await ctx.db.patch(row._id, {
        hasReplied: true,
        updatedAt: now
      })
    }
  }
}

async function findLegacyAttachment(ctx: any, organizationId: any, attachmentId: string) {
  const tableAttachment = await ctx.db
    .query('attachments')
    .withIndex('by_public_id', (query: any) => query.eq('publicId', attachmentId))
    .unique()

  if (tableAttachment && tableAttachment.organizationId === organizationId) {
    return {
      attachment: tableAttachment,
      subjectId: tableAttachment.subjectId,
      subjectType: tableAttachment.subjectType as 'Post' | 'Comment',
      isSubjectComment: tableAttachment.subjectType === 'Comment'
    }
  }

  const posts = await listOrganizationPosts(ctx, organizationId)

  for (const post of posts) {
    const attachment = post.attachments.find((entry: any) => entry.id === attachmentId)

    if (attachment) {
      return {
        attachment,
        subjectId: post._id,
        subjectType: 'Post' as const,
        isSubjectComment: false
      }
    }
  }

  const comments = await ctx.db
    .query('comments')
    .withIndex('by_organization_id', (query: any) => query.eq('organizationId', organizationId))
    .collect()

  for (const comment of comments) {
    const attachment = comment.attachments.find((entry: any) => entry.id === attachmentId)

    if (attachment) {
      return {
        attachment,
        subjectId: comment._id,
        subjectType: 'Comment' as const,
        isSubjectComment: true
      }
    }
  }

  return null
}

async function ensurePostSubscription(ctx: any, organizationId: any, tokenIdentifier: string, postId: string) {
  const existing = await ctx.db
    .query('subscriptions')
    .withIndex('by_organization_user_and_subject', (q: any) =>
      q
        .eq('organizationId', organizationId)
        .eq('userTokenIdentifier', tokenIdentifier)
        .eq('subscribableType', 'Post')
        .eq('subscribableId', postId)
    )
    .unique()

  if (!existing) {
    await ctx.db.insert('subscriptions', {
      organizationId,
      userTokenIdentifier: tokenIdentifier,
      subscribableType: 'Post',
      subscribableId: postId,
      createdAt: Date.now()
    })
  }
}

async function getPostSubscriptions(ctx: any, postId: string) {
  return await ctx.db
    .query('subscriptions')
    .withIndex('by_subject', (q: any) => q.eq('subscribableType', 'Post').eq('subscribableId', postId))
    .collect()
}

async function getProjectSubscriptions(ctx: any, projectId?: string) {
  if (!projectId) {
    return []
  }

  return await ctx.db
    .query('subscriptions')
    .withIndex('by_subject', (q: any) => q.eq('subscribableType', 'Project').eq('subscribableId', projectId))
    .collect()
}

async function deleteArtifactsForSubject(
  ctx: any,
  params: {
    organizationId: any
    subjectType: 'Post' | 'Comment'
    subjectId: string
  }
) {
  const [followUps, reactions, favorites, notifications, subscriptions, attachments] = await Promise.all([
    ctx.db.query('followUps').withIndex('by_subject', (q: any) => q.eq('subjectType', params.subjectType).eq('subjectId', params.subjectId)).collect(),
    ctx.db.query('reactions').withIndex('by_subject', (q: any) => q.eq('subjectType', params.subjectType).eq('subjectId', params.subjectId)).collect(),
    ctx.db.query('favorites').withIndex('by_favoritable', (q: any) => q.eq('favoritableType', params.subjectType).eq('favoritableId', params.subjectId)).collect(),
    ctx.db.query('notifications').collect(),
    params.subjectType === 'Post'
      ? ctx.db.query('subscriptions').withIndex('by_subject', (q: any) => q.eq('subscribableType', 'Post').eq('subscribableId', params.subjectId)).collect()
      : Promise.resolve([]),
    listSubjectAttachments(ctx, {
      subjectType: params.subjectType,
      subjectId: params.subjectId
    })
  ])

  for (const row of followUps) await ctx.db.delete(row._id)
  for (const row of reactions) await ctx.db.delete(row._id)
  for (const row of favorites) await ctx.db.delete(row._id)
  for (const row of subscriptions as any[]) await ctx.db.delete(row._id)
  for (const row of attachments as any[]) await ctx.db.patch(row._id, { discardedAt: Date.now(), updatedAt: Date.now() })
  for (const row of notifications.filter((notification: any) => notification.subjectId === params.subjectId || notification.targetId === params.subjectId)) {
    await ctx.db.delete(row._id)
  }

  if (params.subjectType === 'Post') {
    const [postViews, nonMemberPostViews, postLinks, postLinkPreviews, digestNotes] = await Promise.all([
      ctx.db.query('postViews').withIndex('by_post_id', (q: any) => q.eq('postId', params.subjectId)).collect(),
      ctx.db.query('nonMemberPostViews').withIndex('by_post_id', (q: any) => q.eq('postId', params.subjectId)).collect(),
      listStoredPostLinks(ctx, params.subjectId),
      listStoredPostLinkPreviews(ctx, params.subjectId),
      ctx.db.query('postDigestNotes').withIndex('by_post_id', (q: any) => q.eq('postId', params.subjectId as any)).collect()
    ])

    for (const row of postViews) await ctx.db.delete(row._id)
    for (const row of nonMemberPostViews) await ctx.db.delete(row._id)
    for (const row of postLinks) await ctx.db.delete(row._id)
    for (const row of postLinkPreviews) await ctx.db.delete(row._id)
    for (const row of digestNotes) await ctx.db.patch(row._id, { discardedAt: Date.now(), updatedAt: Date.now() })

    await discardActiveProjectPinsForSubject(ctx, {
      organizationId: params.organizationId,
      subjectType: 'Post',
      subjectId: params.subjectId
    })
    await deleteTimelineEventsForSubject(ctx, {
      subjectType: 'Post',
      subjectId: params.subjectId
    })
    await deletePostHierarchyRows(ctx, params.subjectId)
  }
}

async function getPreviewCommenters(ctx: any, organizationId: any, comments: any[]) {
  const latestUniqueComments = [...comments]
    .sort((a: any, b: any) => b.createdAt - a.createdAt)
    .filter(
      (comment: any, index: number, list: any[]) =>
        list.findIndex((other: any) => other.authorTokenIdentifier === comment.authorTokenIdentifier) === index
    )
    .slice(0, 3)

  const latest_commenters = await Promise.all(
    latestUniqueComments.map((comment: any) => buildLegacyMember(ctx, organizationId, comment.authorTokenIdentifier))
  )

  return { latest_commenters }
}

async function buildLegacyCommentTree(
  ctx: any,
  params: {
    comment: any
    organization: any
    viewerMembership: any
    viewerTokenIdentifier: string
    comments: any[]
  }
): Promise<any> {
  const { comment, organization, viewerMembership, viewerTokenIdentifier, comments } = params
  const member = await buildLegacyMember(ctx, organization._id, comment.authorTokenIdentifier)
  const commentAttachmentRows = await listSubjectAttachments(ctx, {
    subjectType: 'Comment',
    subjectId: comment._id
  })
  const resolvedBy = await buildLegacyMemberByMembershipId(ctx, comment.resolvedByMembershipId)
  const commentAttachments = commentAttachmentRows.length > 0 ? commentAttachmentRows : comment.attachments
  const commentPreviewUrl = buildLegacyMediaUrl(commentAttachments[0]?.previewFilePath ?? commentAttachments[0]?.filePath)
  const [groupedReactions, followUps] = await Promise.all([
    buildLegacyGroupedReactions(ctx, {
      organizationId: organization._id,
      subjectType: 'Comment',
      subjectId: comment._id,
      viewerTokenIdentifier
    }),
    buildLegacySubjectFollowUps(ctx, {
      organizationId: organization._id,
      subjectType: 'Comment',
      subjectId: comment._id,
      viewerTokenIdentifier
    })
  ])
  const timelineEvents = await getSharedTimelineEventsForSubject(ctx, {
    subjectType: 'Comment',
    subjectId: comment._id
  })
  const replies = comments
    .filter((entry: any) => entry.parentCommentId === comment._id)
    .sort((a: any, b: any) => a.createdAt - b.createdAt)

  return {
    id: comment._id,
    created_at: new Date(comment.createdAt).toISOString(),
    timestamp: comment.timestamp ?? null,
    x: comment.x ?? null,
    y: comment.y ?? null,
    body_html: comment.bodyHtml,
    note_highlight: comment.noteHighlight ?? null,
    resolved_at: formatDate(comment.resolvedAt),
    resolved_by: resolvedBy,
    type_name: 'comment',
    subject_type: 'post',
    subject_id: comment.postId,
    url: `/${organization.slug}/posts/${comment.postId}#comment-${comment._id}`,
    viewer_can_resolve: !comment.parentCommentId,
    viewer_can_create_issue: true,
    attachment_id: comment.attachmentId ?? null,
    canvas_preview_url: commentPreviewUrl,
    attachment_thumbnail_url: commentPreviewUrl,
    viewer_is_author: comment.authorTokenIdentifier === viewerTokenIdentifier,
    viewer_can_edit: comment.authorTokenIdentifier === viewerTokenIdentifier,
    viewer_can_follow_up: true,
    viewer_can_react: true,
    viewer_can_delete: comment.authorTokenIdentifier === viewerTokenIdentifier,
    member,
    attachments: commentAttachments.map((attachment: any) =>
      buildLegacyAttachment(attachment, 'Comment', comment._id, true)
    ),
    grouped_reactions: groupedReactions,
    replies: await Promise.all(
      replies.map((reply: any) =>
        buildLegacyCommentTree(ctx, {
          comment: reply,
          organization,
          viewerMembership,
          viewerTokenIdentifier,
          comments
        })
      )
    ),
    follow_ups: followUps,
    parent_id: comment.parentCommentId ?? null,
    is_optimistic: false,
    optimistic_id: null,
    timeline_events: timelineEvents,
    resource_mentions: await getLegacyResourceMentionsFromHtml(ctx, {
      organizationId: organization._id,
      organizationSlug: organization.slug,
      html: comment.bodyHtml
    })
  }
}

async function buildLegacyNoteCommentTree(
  ctx: any,
  params: {
    comment: any
    organization: any
    viewerMembership: any
    viewerTokenIdentifier: string
    comments: any[]
  }
): Promise<any> {
  const { comment, organization, viewerMembership, viewerTokenIdentifier, comments } = params
  const member = await buildLegacyMember(ctx, organization._id, comment.authorTokenIdentifier)
  const commentAttachmentRows = await listSubjectAttachments(ctx, {
    subjectType: 'Comment',
    subjectId: comment._id
  })
  const resolvedBy = await buildLegacyMemberByMembershipId(ctx, comment.resolvedByMembershipId)
  const commentAttachments = commentAttachmentRows.length > 0 ? commentAttachmentRows : comment.attachments
  const commentPreviewUrl = buildLegacyMediaUrl(commentAttachments[0]?.previewFilePath ?? commentAttachments[0]?.filePath)
  const [groupedReactions, followUps, timelineEvents] = await Promise.all([
    buildLegacyGroupedReactions(ctx, {
      organizationId: organization._id,
      subjectType: 'Comment',
      subjectId: comment._id,
      viewerTokenIdentifier
    }),
    buildLegacySubjectFollowUps(ctx, {
      organizationId: organization._id,
      subjectType: 'Comment',
      subjectId: comment._id,
      viewerTokenIdentifier
    }),
    getSharedTimelineEventsForSubject(ctx, {
      subjectType: 'Comment',
      subjectId: comment._id
    })
  ])
  const replies = comments
    .filter((entry: any) => entry.parentCommentId === comment._id)
    .sort((a: any, b: any) => a.createdAt - b.createdAt)

  return {
    id: comment._id,
    created_at: new Date(comment.createdAt).toISOString(),
    timestamp: comment.timestamp ?? null,
    x: comment.x ?? null,
    y: comment.y ?? null,
    body_html: comment.bodyHtml,
    note_highlight: comment.noteHighlight ?? null,
    resolved_at: formatDate(comment.resolvedAt),
    resolved_by: resolvedBy,
    type_name: 'comment',
    subject_type: 'note',
    subject_id: comment.postId,
    url: `/${organization.slug}/notes/${comment.postId}#comment-${comment._id}`,
    viewer_can_resolve: !comment.parentCommentId,
    viewer_can_create_issue: false,
    attachment_id: comment.attachmentId ?? null,
    canvas_preview_url: commentPreviewUrl,
    attachment_thumbnail_url: commentPreviewUrl,
    viewer_is_author: comment.authorTokenIdentifier === viewerTokenIdentifier,
    viewer_can_edit: comment.authorTokenIdentifier === viewerTokenIdentifier,
    viewer_can_follow_up: true,
    viewer_can_react: true,
    viewer_can_delete:
      comment.authorTokenIdentifier === viewerTokenIdentifier || viewerMembership.role === 'admin',
    member,
    attachments: commentAttachments.map((attachment: any) =>
      buildLegacyAttachment(attachment, 'Comment', comment._id, true)
    ),
    grouped_reactions: groupedReactions,
    replies: await Promise.all(
      replies.map((reply: any) =>
        buildLegacyNoteCommentTree(ctx, {
          comment: reply,
          organization,
          viewerMembership,
          viewerTokenIdentifier,
          comments
        })
      )
    ),
    follow_ups: followUps,
    parent_id: comment.parentCommentId ?? null,
    is_optimistic: false,
    optimistic_id: null,
    timeline_events: timelineEvents,
    resource_mentions: await getLegacyResourceMentionsFromHtml(ctx, {
      organizationId: organization._id,
      organizationSlug: organization.slug,
      html: comment.bodyHtml
    })
  }
}

async function buildLegacyPost(ctx: any, params: { post: any; organization: any; viewerMembership: any; viewerTokenIdentifier: string }) {
  const { post, organization, viewerMembership, viewerTokenIdentifier } = params
  const comments = await getPostComments(ctx, post._id)
  const previewCommenters = await getPreviewCommenters(ctx, organization._id, comments)
  const author = await buildLegacyMember(ctx, organization._id, post.authorTokenIdentifier)
  const latestComment = [...comments].sort((a: any, b: any) => b.createdAt - a.createdAt)[0]
  const latestCommentMember =
    latestComment ? await buildLegacyMember(ctx, organization._id, latestComment.authorTokenIdentifier) : null
  const resolvedComment = post.resolvedCommentId
    ? comments.find((comment: any) => comment._id === post.resolvedCommentId) ??
      (await getCommentById(ctx, organization._id, post.resolvedCommentId))
    : null
  const resolvedBy = await buildLegacyMemberByMembershipId(ctx, post.resolvedByMembershipId)
  const viewerHasCommented = comments.some((comment: any) => comment.authorTokenIdentifier === viewerTokenIdentifier)
  const resolvedCommentsCount = comments.filter((comment: any) => !!comment.resolvedAt).length
  const descriptionText = stripHtml(post.descriptionHtml)
  const path = `/${organization.slug}/posts/${post._id}`
  const [
    groupedReactions,
    followUps,
    viewerHasFavorited,
    viewerHasSubscribed,
    activePin,
    postAttachmentRows,
    postViewRows,
    fallbackSubjectViewRows,
    nonMemberPostViews,
    storedLinkRows,
    storedPreviewRows,
    memberships,
    users,
    poll,
    feedbackRequestRows,
    legacyTags,
    hasIterations,
    version,
    project
  ] = await Promise.all([
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
    post.projectId
      ? getActiveProjectPinForSubject(ctx, {
          projectId: post.projectId,
          subjectType: 'Post',
          subjectId: post._id
        })
      : Promise.resolve(null),
    listSubjectAttachments(ctx, {
      subjectType: 'Post',
      subjectId: post._id
    }),
    listDedicatedPostViews(ctx, post._id),
    listSubjectViews(ctx, {
      subjectType: 'Post',
      subjectId: post._id
    }),
    ctx.db.query('nonMemberPostViews').withIndex('by_post_id', (q: any) => q.eq('postId', post._id)).collect(),
    listStoredPostLinks(ctx, post._id),
    listStoredPostLinkPreviews(ctx, post._id),
    ctx.db
      .query('organizationMemberships')
      .withIndex('by_organization_id', (q: any) => q.eq('organizationId', organization._id))
      .collect(),
    ctx.db.query('users').collect(),
    getPostPoll(ctx, post._id),
    listActivePostFeedbackRequests(ctx, post._id),
    listLegacyTagsForPost(ctx, organization, viewerMembership, post._id),
    hasPostIterations(ctx, post._id),
    getPostVersionNumber(ctx, organization._id, post),
    post.projectId ? ctx.db.get(post.projectId) : Promise.resolve(null)
  ])
  const postAttachments = postAttachmentRows.length > 0 ? postAttachmentRows : post.attachments
  const postLinks =
    storedLinkRows.length > 0
      ? storedLinkRows
          .sort((left: any, right: any) => left.createdAt - right.createdAt)
          .map((row: any) => ({ id: row.publicId, name: row.name, url: row.url }))
      : post.links
  const linkPreview = [...storedPreviewRows].sort((left: any, right: any) => right.updatedAt - left.updatedAt)[0] ?? null
  const pollOptions = poll ? await listPollOptions(ctx, poll._id) : []
  const pollVotes = poll ? await listPollVotes(ctx, poll._id) : []
  const membershipsByTokenIdentifier = new Map<string, any>(
    memberships.map((membership: any) => [membership.userTokenIdentifier, membership])
  )
  const membershipsById = new Map<string, any>(memberships.map((membership: any) => [membership._id, membership]))
  const usersByTokenIdentifier = new Map<string, any>(
    users.map((user: any) => [user.tokenIdentifier, user])
  )
  const resolvedViewRows = postViewRows.length > 0 ? postViewRows : fallbackSubjectViewRows
  const legacyPostViews = buildLegacyPostViews(
    resolvedViewRows,
    membershipsByTokenIdentifier,
    usersByTokenIdentifier,
    viewerTokenIdentifier
  )
  const viewerHasViewed = resolvedViewRows.some((row: any) => row.userTokenIdentifier === viewerTokenIdentifier)
  const legacyPoll = poll ? buildLegacyPoll(poll, pollOptions, pollVotes, viewerTokenIdentifier) : null
  const feedbackRequests = buildLegacyFeedbackRequests(feedbackRequestRows, membershipsById, usersByTokenIdentifier)
  const viewerFeedbackStatus = buildViewerFeedbackStatus(feedbackRequestRows, viewerTokenIdentifier)
  const thumbnailUrl = pickSubjectThumbnailUrl(postAttachments) ?? linkPreview?.imageUrl ?? null

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
    version,
    path,
    channel_name: `post-${post._id}`,
    views_count: legacyPostViews.length + (viewerHasViewed ? 1 : 0),
    non_member_views_count: nonMemberPostViews.length,
    status: post.status,
    visibility: post.visibility,
    open_graph_image_url: thumbnailUrl,
    thumbnail_url: thumbnailUrl,
    unfurled_link: linkPreview?.url ?? post.unfurledLink ?? null,
    is_note: post.unfurledLink === 'campsite://note',
    description_html: post.descriptionHtml,
    truncated_description_html: post.descriptionHtml,
    is_text_content_truncated: false,
    truncated_description_text: descriptionText,
    url: path,
    type_name: 'post',
    organization: buildLegacyPublicOrganization(organization, viewerMembership),
    attachments: postAttachments.map((attachment: any) => buildLegacyAttachment(attachment, 'Post', post._id, false)),
    links: postLinks,
    tags: legacyTags,
    poll: legacyPoll,
    feedback_requests: feedbackRequests.length > 0 ? feedbackRequests : null,
    follow_ups: followUps,
    member: author,
    resolved_comment:
      resolvedComment && (await buildLegacyMember(ctx, organization._id, resolvedComment.authorTokenIdentifier))
        ? {
            id: resolvedComment._id,
            created_at: new Date(resolvedComment.createdAt).toISOString(),
            body_html: resolvedComment.bodyHtml,
            url: `${path}#comment-${resolvedComment._id}`,
            viewer_is_author: resolvedComment.authorTokenIdentifier === viewerTokenIdentifier,
            member: await buildLegacyMember(ctx, organization._id, resolvedComment.authorTokenIdentifier)
          }
        : null,
    grouped_reactions: groupedReactions,
    project: post.unfurledLink === 'campsite://note' && !post.projectId ? null : buildLegacyProject(project, post.projectId),
    has_parent: !!post.parentId,
    has_iterations: hasIterations,
    viewer_is_organization_member: true,
    viewer_is_author: post.authorTokenIdentifier === viewerTokenIdentifier,
    viewer_has_commented: viewerHasCommented,
    preview_commenters: previewCommenters,
    viewer_feedback_status: viewerFeedbackStatus,
    viewer_has_subscribed: viewerHasSubscribed || post.authorTokenIdentifier === viewerTokenIdentifier || viewerHasCommented,
    viewer_has_viewed: viewerHasViewed,
    viewer_has_favorited: viewerHasFavorited,
    unseen_comments_count: 0,
    viewer_can_resolve: true,
    viewer_can_favorite: true,
    viewer_can_edit: post.authorTokenIdentifier === viewerTokenIdentifier,
    viewer_can_delete: post.authorTokenIdentifier === viewerTokenIdentifier,
    viewer_can_create_issue: true,
    resolution:
      post.resolvedAt && resolvedBy
        ? {
            resolved_at: new Date(post.resolvedAt).toISOString(),
            resolved_by: resolvedBy,
            resolved_html: post.resolvedHtml ?? null,
            resolved_comment:
              resolvedComment && (await buildLegacyMember(ctx, organization._id, resolvedComment.authorTokenIdentifier))
                ? {
                    id: resolvedComment._id,
                    created_at: new Date(resolvedComment.createdAt).toISOString(),
                    body_html: resolvedComment.bodyHtml,
                    url: `${path}#comment-${resolvedComment._id}`,
                    viewer_is_author: resolvedComment.authorTokenIdentifier === viewerTokenIdentifier,
                    member: await buildLegacyMember(ctx, organization._id, resolvedComment.authorTokenIdentifier)
                  }
                : null
          }
        : null,
    latest_comment_preview:
      latestComment && latestCommentMember
        ? `${latestCommentMember.user.display_name}: ${stripHtml(latestComment.bodyHtml)}`
        : null,
    latest_comment_path: latestComment ? `${path}#comment-${latestComment._id}` : null,
    viewer_is_latest_comment_author: latestComment
      ? latestComment.authorTokenIdentifier === viewerTokenIdentifier
      : false,
    project_pin_id: activePin?.publicId ?? null,
    resource_mentions: await getLegacyResourceMentionsFromHtml(ctx, {
      organizationId: organization._id,
      organizationSlug: organization.slug,
      html: post.descriptionHtml
    })
  }
}

async function listOrganizationPosts(ctx: any, organizationId: any) {
  return await ctx.db.query('posts').withIndex('by_organization_id', (q: any) => q.eq('organizationId', organizationId)).collect()
}

function sortPosts(posts: any[], by: 'last_activity_at' | 'published_at', direction: 'asc' | 'desc') {
  const sorted = [...posts].sort((a: any, b: any) => {
    const left = by === 'published_at' ? a.publishedAt ?? a.createdAt : a.lastActivityAt
    const right = by === 'published_at' ? b.publishedAt ?? b.createdAt : b.lastActivityAt

    return direction === 'asc' ? left - right : right - left
  })

  return sorted
}

function filterLeafPosts(posts: any[]) {
  const parentIds = new Set(posts.map((post: any) => post.parentId).filter(Boolean))

  return posts.filter((post: any) => !parentIds.has(post._id))
}

async function createPostResolutionTimelineEvent(
  ctx: any,
  params: {
    action: 'post_resolved' | 'post_unresolved'
    organizationId: any
    actorMembershipId: any
    actorTokenIdentifier: string
    postId: string
  }
) {
  const now = Date.now()

  await ctx.db.insert('timelineEvents', {
    organizationId: params.organizationId,
    publicId: generateToken(),
    actorType: 'OrganizationMembership',
    actorTokenIdentifier: params.actorTokenIdentifier,
    actorMembershipId: params.actorMembershipId,
    subjectType: 'Post',
    subjectId: params.postId,
    action: params.action,
    createdAt: now,
    updatedAt: now
  })
}

async function createCommentResolutionTimelineEvent(
  ctx: any,
  params: {
    action: 'comment_resolved' | 'comment_unresolved'
    organizationId: any
    actorMembershipId: any
    actorTokenIdentifier: string
    commentId: string
  }
) {
  const now = Date.now()

  await ctx.db.insert('timelineEvents', {
    organizationId: params.organizationId,
    publicId: generateToken(),
    actorType: 'OrganizationMembership',
    actorTokenIdentifier: params.actorTokenIdentifier,
    actorMembershipId: params.actorMembershipId,
    subjectType: 'Comment',
    subjectId: params.commentId,
    action: params.action,
    createdAt: now,
    updatedAt: now
  })
}

async function createPostVisibilityTimelineEvent(
  ctx: any,
  params: {
    organizationId: any
    actorMembershipId: any
    actorTokenIdentifier: string
    postId: string
    fromVisibility: 'default' | 'public'
    toVisibility: 'default' | 'public'
  }
) {
  const now = Date.now()

  await ctx.db.insert('timelineEvents', {
    organizationId: params.organizationId,
    publicId: generateToken(),
    actorType: 'OrganizationMembership',
    actorTokenIdentifier: params.actorTokenIdentifier,
    actorMembershipId: params.actorMembershipId,
    subjectType: 'Post',
    subjectId: params.postId,
    action: 'post_visibility_updated',
    metadataJson: JSON.stringify({
      fromVisibility: params.fromVisibility,
      toVisibility: params.toVisibility
    }),
    createdAt: now,
    updatedAt: now
  })
}

function buildTimelineProjectSnapshot(project?: any | null) {
  const source = project
    ? {
        id: project._id,
        name: project.name,
        accessory: project.accessory ?? null,
        private: !!project.private,
        archived: !!project.archivedAt,
        messageThreadId: project.messageThreadId ?? null
      }
    : {
        id: defaultProject.id,
        name: defaultProject.name,
        accessory: defaultProject.accessory,
        private: defaultProject.private,
        archived: defaultProject.archived,
        messageThreadId: defaultProject.message_thread_id
      }

  return source
}

async function createPostUpdateTimelineEvent(
  ctx: any,
  params: {
    action: 'subject_title_updated' | 'subject_project_updated'
    organizationId: any
    actorMembershipId: any
    actorTokenIdentifier: string
    postId: string
    metadata: Record<string, unknown>
  }
) {
  const now = Date.now()

  await ctx.db.insert('timelineEvents', {
    organizationId: params.organizationId,
    publicId: generateToken(),
    actorType: 'OrganizationMembership',
    actorTokenIdentifier: params.actorTokenIdentifier,
    actorMembershipId: params.actorMembershipId,
    subjectType: 'Post',
    subjectId: params.postId,
    action: params.action,
    metadataJson: JSON.stringify(params.metadata),
    createdAt: now,
    updatedAt: now
  })
}

export const getLegacyPostsPage = query({
  args: {
    slug: v.string(),
    q: v.optional(v.string()),
    limit: v.optional(v.number()),
    projectId: v.optional(v.string()),
    hide_resolved: v.optional(v.boolean()),
    mode: v.union(v.literal('all'), v.literal('for_me'), v.literal('viewer')),
    order: v.optional(
      v.object({
        by: v.union(v.literal('last_activity_at'), v.literal('published_at')),
        direction: v.union(v.literal('asc'), v.literal('desc'))
      })
    )
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)

    if (!context) {
      throw new Error('Organization not found')
    }

    const order = args.order ?? { by: 'last_activity_at' as const, direction: 'desc' as const }
    const limit = Math.max(1, Math.min(args.limit ?? 20, 100))
    const queryText = args.q?.trim().toLowerCase()
    let posts = (await listOrganizationPosts(ctx, context.organization._id)).filter(
      (post: any) =>
        !post.draft &&
        !!post.publishedAt &&
        // Exclude private note-posts (notes without a project/channel association)
        !(post.unfurledLink === 'campsite://note' && !post.projectId)
    )
    const projects = await ctx.db
      .query('projects')
      .withIndex('by_organization_id', (q: any) => q.eq('organizationId', context.organization._id))
      .collect()
    const activeProjectsById = new Map(
      projects.filter((project: any) => !project.archivedAt).map((project: any) => [project._id, project])
    )

    if (args.projectId) {
      posts = posts.filter((post: any) => post.projectId === args.projectId)
    }

    if (args.mode === 'viewer') {
      posts = posts.filter((post: any) => post.authorTokenIdentifier === context.identity.tokenIdentifier)
    }

    if (args.mode === 'for_me') {
      const [projectMemberships, subscriptions] = await Promise.all([
        ctx.db
          .query('projectMemberships')
          .withIndex('by_organization_and_user', (q: any) =>
            q.eq('organizationId', context.organization._id).eq('userTokenIdentifier', context.identity.tokenIdentifier)
          )
          .collect(),
        ctx.db
          .query('subscriptions')
          .withIndex('by_organization_and_user', (q: any) =>
            q.eq('organizationId', context.organization._id).eq('userTokenIdentifier', context.identity.tokenIdentifier)
          )
          .collect()
      ])
      const membershipProjectIds = new Set(projectMemberships.map((membership: any) => membership.projectId))
      const subscribedProjectIds = new Set(
        subscriptions
          .filter((subscription: any) => subscription.subscribableType === 'Project')
          .map((subscription: any) => subscription.subscribableId)
      )
      const subscribedPostIds = new Set(
        subscriptions
          .filter((subscription: any) => subscription.subscribableType === 'Post')
          .map((subscription: any) => subscription.subscribableId)
      )

      posts = posts.filter((post: any) => {
        if (!post.projectId || !activeProjectsById.has(post.projectId)) {
          return false
        }

        return (
          membershipProjectIds.has(post.projectId) ||
          subscribedProjectIds.has(post.projectId) ||
          subscribedPostIds.has(post._id)
        )
      })
    }

    if (args.projectId) {
      posts = posts.filter((post: any) => !!post.projectId && activeProjectsById.has(post.projectId))
    }

    if (args.hide_resolved) {
      posts = posts.filter((post: any) => !post.resolvedAt)
    }

    if (queryText) {
      posts = posts.filter((post: any) => {
        const haystack = `${post.title} ${stripHtml(post.descriptionHtml)}`.toLowerCase()
        return haystack.includes(queryText)
      })
    } else {
      posts = filterLeafPosts(posts)
    }

    posts = sortPosts(posts, order.by, order.direction).slice(0, limit)

    return {
      data: await Promise.all(
        posts.map((post: any) =>
          buildLegacyPost(ctx, {
            post,
            organization: context.organization,
            viewerMembership: context.viewerMembership,
            viewerTokenIdentifier: context.identity.tokenIdentifier
          })
        )
      ),
      next_cursor: null,
      prev_cursor: null
    }
  }
})

export const getLegacyPersonalDraftPostsPage = query({
  args: {
    slug: v.string(),
    after: v.optional(v.string()),
    limit: v.optional(v.number()),
    order: v.optional(
      v.object({
        by: v.literal('last_activity_at'),
        direction: v.union(v.literal('asc'), v.literal('desc'))
      })
    )
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)

    if (!context) {
      throw new Error('Organization not found')
    }

    const order = args.order ?? { by: 'last_activity_at' as const, direction: 'desc' as const }
    const limit = Math.max(1, Math.min(args.limit ?? 20, 100))
    const posts = sortPosts(
      (await listOrganizationPosts(ctx, context.organization._id)).filter(
        (post: any) => post.authorTokenIdentifier === context.identity.tokenIdentifier && !!post.draft
      ),
      order.by,
      order.direction
    ).slice(0, limit)

    return {
      data: await Promise.all(
        posts.map((post: any) =>
          buildLegacyPost(ctx, {
            post,
            organization: context.organization,
            viewerMembership: context.viewerMembership,
            viewerTokenIdentifier: context.identity.tokenIdentifier
          })
        )
      ),
      next_cursor: null,
      prev_cursor: null
    }
  }
})

export const getLegacyMemberPostsPage = query({
  args: {
    slug: v.string(),
    username: v.string(),
    after: v.optional(v.string()),
    limit: v.optional(v.number()),
    order: v.optional(
      v.object({
        by: v.union(v.literal('last_activity_at'), v.literal('published_at')),
        direction: v.union(v.literal('asc'), v.literal('desc'))
      })
    )
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)

    if (!context) {
      throw new Error('Organization not found')
    }

    const memberships = await ctx.db
      .query('organizationMemberships')
      .withIndex('by_organization_id', (q: any) => q.eq('organizationId', context.organization._id))
      .collect()

    const users = await Promise.all(
      memberships.map((membership: any) => getUserByTokenIdentifier(ctx, membership.userTokenIdentifier))
    )

    const matchingMembership = memberships.find((_membership: any, index: number) => users[index]?.username === args.username)

    if (!matchingMembership) {
      throw new Error('Organization member not found')
    }

    const order = args.order ?? { by: 'published_at' as const, direction: 'desc' as const }
    const limit = Math.max(1, Math.min(args.limit ?? 20, 100))
    const allMemberPosts = (await listOrganizationPosts(ctx, context.organization._id)).filter(
      (post: any) => post.authorTokenIdentifier === matchingMembership.userTokenIdentifier
    )

    const posts = sortPosts(
      allMemberPosts.filter(
        (post: any) =>
          !post.draft &&
          post.unfurledLink !== 'campsite://note'
      ),
      order.by,
      order.direction
    ).slice(0, limit)

    return {
      data: await Promise.all(
        posts.map((post: any) =>
          buildLegacyPost(ctx, {
            post,
            organization: context.organization,
            viewerMembership: context.viewerMembership,
            viewerTokenIdentifier: context.identity.tokenIdentifier
          })
        )
      ),
      next_cursor: null,
      prev_cursor: null,
      _debug: allMemberPosts.map((p: any) => ({ id: p._id, title: p.title, unfurledLink: p.unfurledLink, draft: p.draft, projectId: p.projectId }))
    }
  }
})

export const getLegacyPostById = query({
  args: {
    slug: v.string(),
    postId: v.string()
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)

    if (!context) {
      return null
    }

    const post = await getPostById(ctx, context.organization._id, args.postId)

    if (!post) {
      return null
    }

    return await buildLegacyPost(ctx, {
      post,
      organization: context.organization,
      viewerMembership: context.viewerMembership,
      viewerTokenIdentifier: context.identity.tokenIdentifier
    })
  }
})

export const getLegacySyncTags = query({
  args: {
    slug: v.string()
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)

    if (!context) {
      throw createError('not_found', 'Organization not found')
    }

    const tags = await listOrganizationTags(ctx, context.organization._id)
    const counts = await Promise.all(tags.map((tag: any) => countPostsForTag(ctx, tag._id)))

    return tags.map((tag: any, index: number) =>
      buildLegacyTag(tag, context.organization, counts[index] ?? 0, context.viewerMembership)
    )
  }
})

export const getLegacyTagsPage = query({
  args: {
    slug: v.string(),
    q: v.optional(v.string()),
    after: v.optional(v.string()),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)

    if (!context) {
      throw createError('not_found', 'Organization not found')
    }

    const queryText = args.q?.trim().toLowerCase()
    let tags = await listOrganizationTags(ctx, context.organization._id)

    if (queryText) {
      tags = tags.filter((tag: any) => tag.name.toLowerCase().includes(queryText))
    }

    const counts = await Promise.all(tags.map((tag: any) => countPostsForTag(ctx, tag._id)))
    const serialized = tags.map((tag: any, index: number) =>
      buildLegacyTag(tag, context.organization, counts[index] ?? 0, context.viewerMembership)
    )

    return paginateByCursor(serialized, args.after, args.limit)
  }
})

export const getLegacyTagByName = query({
  args: {
    slug: v.string(),
    tagName: v.string()
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)

    if (!context) {
      throw createError('not_found', 'Organization not found')
    }

    const tag = await getTagByName(ctx, context.organization._id, args.tagName)

    if (!tag) {
      throw createError('not_found', 'Tag not found')
    }

    return buildLegacyTag(tag, context.organization, await countPostsForTag(ctx, tag._id), context.viewerMembership)
  }
})

export const createLegacyTag = mutation({
  args: {
    slug: v.string(),
    name: v.string()
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)

    if (!context) {
      throw createError('not_found', 'Organization not found')
    }

    const name = normalizeTagName(args.name)
    validateTagName(name)

    const existing = await getTagByName(ctx, context.organization._id, name)

    if (existing) {
      throw createError('unprocessable', 'Tag name has already been taken')
    }

    const tagId = await ctx.db.insert('tags', {
      organizationId: context.organization._id,
      name,
      createdAt: Date.now()
    })
    const tag = await ctx.db.get(tagId)

    if (!tag) {
      throw createError('unprocessable', 'Tag could not be created')
    }

    return buildLegacyTag(tag, context.organization, 0, context.viewerMembership)
  }
})

export const updateLegacyTag = mutation({
  args: {
    slug: v.string(),
    tagName: v.string(),
    name: v.string()
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)

    if (!context) {
      throw createError('not_found', 'Organization not found')
    }

    const tag = await getTagByName(ctx, context.organization._id, args.tagName)

    if (!tag) {
      throw createError('not_found', 'Tag not found')
    }

    const name = normalizeTagName(args.name)
    validateTagName(name)

    const existing = await getTagByName(ctx, context.organization._id, name)

    if (existing && existing._id !== tag._id) {
      throw createError('unprocessable', 'Tag name has already been taken')
    }

    await ctx.db.patch(tag._id, { name })
    const updated = await ctx.db.get(tag._id)

    if (!updated) {
      throw createError('not_found', 'Tag not found')
    }

    return buildLegacyTag(updated, context.organization, await countPostsForTag(ctx, updated._id), context.viewerMembership)
  }
})

export const deleteLegacyTag = mutation({
  args: {
    slug: v.string(),
    tagName: v.string()
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)

    if (!context) {
      throw createError('not_found', 'Organization not found')
    }

    const tag = await getTagByName(ctx, context.organization._id, args.tagName)

    if (!tag) {
      throw createError('not_found', 'Tag not found')
    }

    const taggings = await listPostTaggingsForTag(ctx, tag._id)

    for (const tagging of taggings) {
      await ctx.db.delete(tagging._id)
    }

    await ctx.db.delete(tag._id)

    return {}
  }
})

export const getLegacyTagPostsPage = query({
  args: {
    slug: v.string(),
    tagName: v.string(),
    after: v.optional(v.string()),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)

    if (!context) {
      throw createError('not_found', 'Organization not found')
    }

    const tag = await getTagByName(ctx, context.organization._id, args.tagName)

    if (!tag) {
      throw createError('not_found', 'Tag not found')
    }

    const taggings = await listPostTaggingsForTag(ctx, tag._id)
    const posts = (
      await Promise.all(
        taggings.map(async (tagging: any) => {
          return await getPostById(ctx, context.organization._id, tagging.postId)
        })
      )
    )
      .filter(Boolean)
      .sort((left: any, right: any) => {
        const leftTs = left.publishedAt ?? left.createdAt
        const rightTs = right.publishedAt ?? right.createdAt
        return rightTs - leftTs
      })

    const serialized = await Promise.all(
      posts.map((post: any) =>
        buildLegacyPost(ctx, {
          post,
          organization: context.organization,
          viewerMembership: context.viewerMembership,
          viewerTokenIdentifier: context.identity.tokenIdentifier
        })
      )
    )

    return paginateByCursor(serialized, args.after, args.limit)
  }
})

export const createLegacyPost = mutation({
  args: {
    slug: v.string(),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    description_html: v.optional(v.string()),
    project_id: v.optional(v.string()),
    unfurled_link: v.optional(v.union(v.string(), v.null())),
    parent_id: v.optional(v.union(v.string(), v.null())),
    links: v.array(
      v.object({
        name: v.string(),
        url: v.string()
      })
    ),
    poll: v.optional(
      v.object({
        description: v.string(),
        options: v.array(
          v.object({
            description: v.string()
          })
        )
      })
    ),
    feedback_request_member_ids: v.optional(v.array(v.string())),
    tags: v.optional(v.array(v.string())),
    status: v.optional(v.union(v.literal('none'), v.literal('feedback_requested'))),
    draft: v.optional(v.boolean()),
    attachments: v.optional(
      v.array(
        v.object({
          file_path: v.string(),
          file_type: v.string(),
          preview_file_path: v.optional(v.union(v.string(), v.null())),
          name: v.optional(v.union(v.string(), v.null())),
          size: v.optional(v.union(v.number(), v.null())),
          width: v.optional(v.number()),
          height: v.optional(v.number()),
          duration: v.optional(v.number())
        })
      )
    )
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)

    if (!context) {
      throw new Error('Organization not found')
    }

    if (args.project_id) {
      const project = (await ctx.db.get(args.project_id as any)) as { _id: any; private: boolean } | null

      if (project && !project.private) {
        const existingMembership = await ctx.db
          .query('projectMemberships')
          .withIndex('by_project_and_user', (q: any) =>
            q.eq('projectId', project._id).eq('userTokenIdentifier', context.identity.tokenIdentifier)
          )
          .unique()

        if (!existingMembership) {
          await ctx.db.insert('projectMemberships', {
            organizationId: context.organization._id,
            projectId: project._id,
            userTokenIdentifier: context.identity.tokenIdentifier,
            createdAt: Date.now()
          })
        }
      }
    }

    const now = Date.now()
    const parentPost = args.parent_id ? await getPostById(ctx, context.organization._id, args.parent_id) : null
    const rootPostId = parentPost?.rootPostId ?? parentPost?._id
    const nextVersion = parentPost
      ? (await getPostVersionNumber(ctx, context.organization._id, parentPost)) + 1
      : 1
    const postId = await ctx.db.insert('posts', {
      organizationId: context.organization._id,
      authorTokenIdentifier: context.identity.tokenIdentifier,
      title: args.title?.trim() || '',
      descriptionHtml: toDescriptionHtml(args.description, args.description_html),
      unfurledLink: args.unfurled_link || undefined,
      status: args.status ?? 'none',
      visibility: 'default',
      projectId: args.project_id,
      draft: !!args.draft,
      links: args.links.map((link: any, index: number) => ({
        id: `link-${now}-${index}`,
        name: link.name,
        url: link.url
      })),
      attachments: (args.attachments ?? []).map((attachment: any, index: number) => ({
        id: `attachment-${now}-${index}`,
        filePath: attachment.file_path,
        fileType: attachment.file_type,
        previewFilePath: attachment.preview_file_path || undefined,
        name: attachment.name || undefined,
        size: attachment.size || undefined,
        width: attachment.width,
        height: attachment.height,
        duration: attachment.duration
      })),
      parentId: parentPost?._id,
      rootPostId,
      version: nextVersion,
      createdAt: now,
      updatedAt: now,
      lastActivityAt: now,
      publishedAt: args.draft ? undefined : now
    })

    const post = await getPostById(ctx, context.organization._id, postId)

    if (!post) {
      throw new Error('Post could not be created')
    }

    await syncPostHierarchyRows(ctx, {
      organizationId: context.organization._id,
      postId: post._id,
      parentId: parentPost?._id
    })
    await syncPostLinksAndPreviews(ctx, {
      organizationId: context.organization._id,
      postId: post._id,
      links: args.links,
      unfurledLink: args.unfurled_link ?? null
    })

    const postAttachmentsInput = args.attachments ?? []

    for (let index = 0; index < postAttachmentsInput.length; index += 1) {
      const attachment = postAttachmentsInput[index]

      await createSubjectAttachment(ctx, {
        organizationId: context.organization._id,
        subjectType: 'Post',
        subjectId: post._id,
        publicId: post.attachments[index]?.id ?? `attachment-${now}-${index}`,
        filePath: attachment.file_path,
        fileType: attachment.file_type,
        previewFilePath: attachment.preview_file_path ?? null,
        name: attachment.name ?? null,
        size: attachment.size ?? null,
        width: attachment.width,
        height: attachment.height,
        duration: attachment.duration,
        position: index
      })
    }

    if (args.poll && post) {
      const pollId = await ctx.db.insert('polls', {
        organizationId: context.organization._id,
        postId: post._id,
        publicId: generateToken(),
        description: args.poll.description,
        createdAt: now,
        updatedAt: now
      })

      for (let index = 0; index < args.poll.options.length; index += 1) {
        const option = args.poll.options[index]

        await ctx.db.insert('pollOptions', {
          organizationId: context.organization._id,
          pollId,
          publicId: generateToken(),
          description: option.description,
          position: index,
          createdAt: now,
          updatedAt: now
        })
      }
    }

    await replacePostTags(ctx, {
      organizationId: context.organization._id,
      postId: post._id,
      tags: args.tags
    })

    await ensurePostSubscription(ctx, context.organization._id, context.identity.tokenIdentifier, post._id)

    const projectSubscriptions = await getProjectSubscriptions(ctx, post.projectId)
    const targetTitle = post.title || stripHtml(post.descriptionHtml)

    if (args.status === 'feedback_requested' && (args.feedback_request_member_ids?.length ?? 0) > 0) {
      await replacePostFeedbackRequests(ctx, {
        organizationId: context.organization._id,
        postId: post._id,
        memberIds: args.feedback_request_member_ids ?? [],
        actorTokenIdentifier: context.identity.tokenIdentifier,
        targetTitle,
        targetProjectId: post.projectId
      })
    }

    for (const subscription of projectSubscriptions) {
      await createNotificationRecord(ctx, {
        organizationId: context.organization._id,
        recipientTokenIdentifier: subscription.userTokenIdentifier,
        actorTokenIdentifier: context.identity.tokenIdentifier,
        reason: 'project_subscription',
        inboxKey: `project:${post.projectId}:post:${post._id}`,
        subjectType: 'Post',
        subjectId: post._id,
        subjectTitle: targetTitle,
        targetType: 'Post',
        targetId: post._id,
        targetTitle,
        targetProjectId: post.projectId,
        bodyPreviewPrefix: 'Posted',
        bodyPreview: targetTitle
      })
    }

    return await buildLegacyPost(ctx, {
      post,
      organization: context.organization,
      viewerMembership: context.viewerMembership,
      viewerTokenIdentifier: context.identity.tokenIdentifier
    })
  }
})

export const updateLegacyPost = mutation({
  args: {
    slug: v.string(),
    postId: v.string(),
    title: v.optional(v.string()),
    description_html: v.optional(v.string()),
    project_id: v.optional(v.union(v.string(), v.null())),
    unfurled_link: v.optional(v.union(v.string(), v.null())),
    status: v.optional(v.union(v.literal('none'), v.literal('feedback_requested'))),
    feedback_request_member_ids: v.optional(v.array(v.string())),
    tags: v.optional(v.array(v.string()))
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)

    if (!context) {
      throw new Error('Organization not found')
    }

    const post = await getPostById(ctx, context.organization._id, args.postId)

    if (!post) {
      throw new Error('Post not found')
    }

    if (post.authorTokenIdentifier !== context.identity.tokenIdentifier) {
      throw new Error('Not allowed to edit this post')
    }

    const previousProjectId = post.projectId
    const previousTitle = post.title
    const now = Date.now()
    const updates: Record<string, any> = {
      updatedAt: now,
      lastActivityAt: now
    }

    if (typeof args.title === 'string') {
      updates.title = args.title.trim()
    }

    if (typeof args.description_html === 'string') {
      updates.descriptionHtml = args.description_html
    }

    if (args.project_id !== undefined) {
      updates.projectId = args.project_id || undefined
    }

    if (args.unfurled_link !== undefined) {
      updates.unfurledLink = args.unfurled_link || undefined
    }

    if (args.status) {
      updates.status = args.status
    }

    await ctx.db.patch(post._id, updates)
    await syncPostLinksAndPreviews(ctx, {
      organizationId: context.organization._id,
      postId: post._id,
      links: post.links,
      unfurledLink: args.unfurled_link !== undefined ? args.unfurled_link : post.unfurledLink ?? null
    })
    await replacePostTags(ctx, {
      organizationId: context.organization._id,
      postId: post._id,
      tags: args.tags
    })

    if (args.project_id !== undefined && previousProjectId && previousProjectId !== (args.project_id || undefined)) {
      await discardActiveProjectPinsForSubject(ctx, {
        organizationId: context.organization._id,
        actorMembershipId: context.viewerMembership._id,
        actorTokenIdentifier: context.identity.tokenIdentifier,
        recordTimelineEvent: true,
        subjectType: 'Post',
        subjectId: post._id
      })
    }

    const updated: any = await ctx.db.get(post._id)

    if (!updated) {
      throw new Error('Post not found')
    }

    if (!updated.draft) {
      const titleChanged = typeof args.title === 'string' && previousTitle !== updated.title
      const projectChanged = args.project_id !== undefined && previousProjectId !== updated.projectId

      if (titleChanged) {
        await createPostUpdateTimelineEvent(ctx, {
          action: 'subject_title_updated',
          organizationId: context.organization._id,
          actorMembershipId: context.viewerMembership._id,
          actorTokenIdentifier: context.identity.tokenIdentifier,
          postId: updated._id,
          metadata: {
            subjectUpdatedFromTitle: previousTitle || null,
            subjectUpdatedToTitle: updated.title || null
          }
        })
      }

      if (projectChanged) {
        const [previousProject, nextProject] = await Promise.all([
          previousProjectId ? ctx.db.get(previousProjectId) : Promise.resolve(null),
          updated.projectId ? ctx.db.get(updated.projectId) : Promise.resolve(null)
        ])

        await createPostUpdateTimelineEvent(ctx, {
          action: 'subject_project_updated',
          organizationId: context.organization._id,
          actorMembershipId: context.viewerMembership._id,
          actorTokenIdentifier: context.identity.tokenIdentifier,
          postId: updated._id,
          metadata: {
            subjectUpdatedFromProject: buildTimelineProjectSnapshot(previousProject),
            subjectUpdatedToProject: buildTimelineProjectSnapshot(nextProject)
          }
        })
      }
    }

    if (args.feedback_request_member_ids !== undefined || args.status === 'feedback_requested' || args.status === 'none') {
      const targetTitle = updated.title || stripHtml(updated.descriptionHtml)
      const effectiveStatus = args.status ?? updated.status

      await replacePostFeedbackRequests(ctx, {
        organizationId: context.organization._id,
        postId: updated._id,
        memberIds: effectiveStatus === 'feedback_requested' ? (args.feedback_request_member_ids ?? []) : [],
        actorTokenIdentifier: context.identity.tokenIdentifier,
        targetTitle,
        targetProjectId: updated.projectId
      })
    }

    return await buildLegacyPost(ctx, {
      post: updated,
      organization: context.organization,
      viewerMembership: context.viewerMembership,
      viewerTokenIdentifier: context.identity.tokenIdentifier
    })
  }
})

export const resolveLegacyComment = mutation({
  args: {
    slug: v.string(),
    commentId: v.string()
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)

    if (!context) {
      throw new Error('Organization not found')
    }

    const comment = await getCommentById(ctx, context.organization._id, args.commentId)

    if (!comment) {
      throw new Error('Comment not found')
    }

    await ctx.db.patch(comment._id, {
      resolvedAt: Date.now(),
      resolvedByMembershipId: context.viewerMembership._id,
      updatedAt: Date.now()
    })
    await createCommentResolutionTimelineEvent(ctx, {
      action: 'comment_resolved',
      organizationId: context.organization._id,
      actorMembershipId: context.viewerMembership._id,
      actorTokenIdentifier: context.identity.tokenIdentifier,
      commentId: comment._id
    })

    const post = await getPostById(ctx, context.organization._id, comment.postId)
    const noteRow = await getNoteRowByPublicId(ctx, comment.postId)

    if (post) {
      const targetTitle = post.title || stripHtml(post.descriptionHtml)

      await createNotificationRecord(ctx, {
        organizationId: context.organization._id,
        recipientTokenIdentifier: comment.authorTokenIdentifier,
        actorTokenIdentifier: context.identity.tokenIdentifier,
        reason: 'comment_resolved',
        inboxKey: `comment:${comment._id}:resolved`,
        subjectType: 'Comment',
        subjectId: comment._id,
        subjectTitle: stripHtml(comment.bodyHtml),
        targetType: noteRow ? 'Note' : 'Post',
        targetId: post._id,
        targetTitle,
        targetProjectId: post.projectId,
        targetResolved: !!post.resolvedAt,
        bodyPreviewPrefix: 'Resolved',
        bodyPreview: stripHtml(comment.bodyHtml)
      })
    }

    return {}
  }
})

export const unresolveLegacyComment = mutation({
  args: {
    slug: v.string(),
    commentId: v.string()
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)

    if (!context) {
      throw new Error('Organization not found')
    }

    const comment = await getCommentById(ctx, context.organization._id, args.commentId)

    if (!comment) {
      throw new Error('Comment not found')
    }

    await ctx.db.patch(comment._id, {
      resolvedAt: undefined,
      resolvedByMembershipId: undefined,
      updatedAt: Date.now()
    })
    await createCommentResolutionTimelineEvent(ctx, {
      action: 'comment_unresolved',
      organizationId: context.organization._id,
      actorMembershipId: context.viewerMembership._id,
      actorTokenIdentifier: context.identity.tokenIdentifier,
      commentId: comment._id
    })

    const post = await getPostById(ctx, context.organization._id, comment.postId)

    if (post?.resolvedCommentId === comment._id) {
      await ctx.db.patch(post._id, {
        resolvedAt: undefined,
        resolvedByMembershipId: undefined,
        resolvedHtml: undefined,
        resolvedCommentId: undefined,
        updatedAt: Date.now(),
        lastActivityAt: Date.now()
      })

      await createPostResolutionTimelineEvent(ctx, {
        action: 'post_unresolved',
        organizationId: context.organization._id,
        actorMembershipId: context.viewerMembership._id,
        actorTokenIdentifier: context.identity.tokenIdentifier,
        postId: post._id
      })
    }

    return {}
  }
})

export const updateLegacyPostVisibility = mutation({
  args: {
    slug: v.string(),
    postId: v.string(),
    visibility: v.union(v.literal('default'), v.literal('public'))
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)

    if (!context) {
      throw createError('not_found', 'Organization not found')
    }

    const post = await getPostById(ctx, context.organization._id, args.postId)

    if (!post) {
      throw createError('not_found', 'Post not found')
    }

    if (post.authorTokenIdentifier !== context.identity.tokenIdentifier) {
      throw createError('forbidden', 'Not allowed to change post visibility')
    }

    if (post.visibility === args.visibility) {
      return {}
    }

    const previousVisibility = post.visibility
    const now = Date.now()

    await ctx.db.patch(post._id, {
      visibility: args.visibility,
      updatedAt: now,
      lastActivityAt: now
    })

    await createPostVisibilityTimelineEvent(ctx, {
      organizationId: context.organization._id,
      actorMembershipId: context.viewerMembership._id,
      actorTokenIdentifier: context.identity.tokenIdentifier,
      postId: post._id,
      fromVisibility: previousVisibility,
      toVisibility: args.visibility
    })

    return {}
  }
})

export const resolveLegacyPost = mutation({
  args: {
    slug: v.string(),
    postId: v.string(),
    resolve_html: v.optional(v.union(v.string(), v.null())),
    comment_id: v.optional(v.union(v.string(), v.null()))
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)

    if (!context) {
      throw new Error('Organization not found')
    }

    const post = await getPostById(ctx, context.organization._id, args.postId)

    if (!post) {
      throw new Error('Post not found')
    }

    const resolvedComment = args.comment_id
      ? await getCommentById(ctx, context.organization._id, args.comment_id)
      : null

    if (resolvedComment && resolvedComment.postId !== post._id) {
      throw new Error('Comment does not belong to this post')
    }

    const now = Date.now()

    await ctx.db.patch(post._id, {
      resolvedAt: now,
      resolvedByMembershipId: context.viewerMembership._id,
      resolvedHtml: args.resolve_html ?? undefined,
      resolvedCommentId: resolvedComment?._id,
      updatedAt: now,
      lastActivityAt: now
    })

    await createPostResolutionTimelineEvent(ctx, {
      action: 'post_resolved',
      organizationId: context.organization._id,
      actorMembershipId: context.viewerMembership._id,
      actorTokenIdentifier: context.identity.tokenIdentifier,
      postId: post._id
    })

    return {}
  }
})

export const unresolveLegacyPost = mutation({
  args: {
    slug: v.string(),
    postId: v.string()
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)

    if (!context) {
      throw new Error('Organization not found')
    }

    const post = await getPostById(ctx, context.organization._id, args.postId)

    if (!post) {
      throw new Error('Post not found')
    }

    const now = Date.now()

    await ctx.db.patch(post._id, {
      resolvedAt: undefined,
      resolvedByMembershipId: undefined,
      resolvedHtml: undefined,
      resolvedCommentId: undefined,
      updatedAt: now,
      lastActivityAt: now
    })

    await createPostResolutionTimelineEvent(ctx, {
      action: 'post_unresolved',
      organizationId: context.organization._id,
      actorMembershipId: context.viewerMembership._id,
      actorTokenIdentifier: context.identity.tokenIdentifier,
      postId: post._id
    })

    return {}
  }
})

export const createLegacyPostPoll = mutation({
  args: {
    slug: v.string(),
    postId: v.string(),
    description: v.string(),
    options: v.array(
      v.object({
        description: v.string()
      })
    )
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)

    if (!context) {
      throw new Error('Organization not found')
    }

    const post = await getPostById(ctx, context.organization._id, args.postId)

    if (!post) {
      throw new Error('Post not found')
    }

    if (post.authorTokenIdentifier !== context.identity.tokenIdentifier) {
      throw new Error('Not allowed to edit this post')
    }

    const existingPoll = await getPostPoll(ctx, post._id)

    if (existingPoll) {
      throw new Error('Poll already exists')
    }

    const now = Date.now()
    const pollId = await ctx.db.insert('polls', {
      organizationId: context.organization._id,
      postId: post._id,
      publicId: generateToken(),
      description: args.description,
      createdAt: now,
      updatedAt: now
    })

    for (let index = 0; index < args.options.length; index += 1) {
      const option = args.options[index]

      await ctx.db.insert('pollOptions', {
        organizationId: context.organization._id,
        pollId,
        publicId: generateToken(),
        description: option.description,
        position: index,
        createdAt: now,
        updatedAt: now
      })
    }

    await ctx.db.patch(post._id, {
      updatedAt: now,
      lastActivityAt: now
    })

    const updated: any = await ctx.db.get(post._id)

    return await buildLegacyPost(ctx, {
      post: updated,
      organization: context.organization,
      viewerMembership: context.viewerMembership,
      viewerTokenIdentifier: context.identity.tokenIdentifier
    })
  }
})

export const updateLegacyPostPoll = mutation({
  args: {
    slug: v.string(),
    postId: v.string(),
    description: v.string(),
    options: v.array(
      v.object({
        id: v.optional(v.string()),
        description: v.string()
      })
    )
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)

    if (!context) {
      throw new Error('Organization not found')
    }

    const post = await getPostById(ctx, context.organization._id, args.postId)

    if (!post) {
      throw new Error('Post not found')
    }

    if (post.authorTokenIdentifier !== context.identity.tokenIdentifier) {
      throw new Error('Not allowed to edit this post')
    }

    const poll = await getPostPoll(ctx, post._id)

    if (!poll) {
      throw new Error('Poll not found')
    }

    const existingOptions = await listPollOptions(ctx, poll._id)
    const now = Date.now()
    const seenOptionIds = new Set<string>()

    await ctx.db.patch(poll._id, {
      description: args.description,
      updatedAt: now
    })

    for (let index = 0; index < args.options.length; index += 1) {
      const option = args.options[index]
      const existing = option.id ? existingOptions.find((row: any) => row.publicId === option.id) : null

      if (existing) {
        seenOptionIds.add(existing._id)
        await ctx.db.patch(existing._id, {
          description: option.description,
          position: index,
          updatedAt: now
        })
      } else {
        const optionId = await ctx.db.insert('pollOptions', {
          organizationId: context.organization._id,
          pollId: poll._id,
          publicId: generateToken(),
          description: option.description,
          position: index,
          createdAt: now,
          updatedAt: now
        })

        seenOptionIds.add(optionId)
      }
    }

    for (const option of existingOptions) {
      if (seenOptionIds.has(option._id)) {
        continue
      }

      const votes = await ctx.db
        .query('pollVotes')
        .withIndex('by_poll_option_id', (query: any) => query.eq('pollOptionId', option._id))
        .collect()

      for (const vote of votes) {
        await ctx.db.delete(vote._id)
      }

      await ctx.db.delete(option._id)
    }

    await ctx.db.patch(post._id, {
      updatedAt: now,
      lastActivityAt: now
    })

    const updated: any = await ctx.db.get(post._id)

    return await buildLegacyPost(ctx, {
      post: updated,
      organization: context.organization,
      viewerMembership: context.viewerMembership,
      viewerTokenIdentifier: context.identity.tokenIdentifier
    })
  }
})

export const deleteLegacyPostPoll = mutation({
  args: {
    slug: v.string(),
    postId: v.string()
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)

    if (!context) {
      throw new Error('Organization not found')
    }

    const post = await getPostById(ctx, context.organization._id, args.postId)

    if (!post) {
      throw new Error('Post not found')
    }

    if (post.authorTokenIdentifier !== context.identity.tokenIdentifier) {
      throw new Error('Not allowed to edit this post')
    }

    const poll = await getPostPoll(ctx, post._id)

    if (!poll) {
      return {}
    }

    const [options, votes] = await Promise.all([
      listPollOptions(ctx, poll._id),
      listPollVotes(ctx, poll._id)
    ])

    for (const vote of votes) {
      await ctx.db.delete(vote._id)
    }

    for (const option of options) {
      await ctx.db.delete(option._id)
    }

    await ctx.db.delete(poll._id)
    await ctx.db.patch(post._id, {
      updatedAt: Date.now(),
      lastActivityAt: Date.now()
    })

    return {}
  }
})

export const voteLegacyPostPollOption = mutation({
  args: {
    slug: v.string(),
    postId: v.string(),
    optionId: v.string()
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)

    if (!context) {
      throw new Error('Organization not found')
    }

    const post = await getPostById(ctx, context.organization._id, args.postId)

    if (!post) {
      throw new Error('Post not found')
    }

    const poll = await getPostPoll(ctx, post._id)
    const option = await getPollOptionByPublicId(ctx, args.optionId)

    if (!poll || !option || option.pollId !== poll._id) {
      throw new Error('Poll option not found')
    }

    const existingVote = await ctx.db
      .query('pollVotes')
      .withIndex('by_poll_and_user', (query: any) =>
        query.eq('pollId', poll._id).eq('userTokenIdentifier', context.identity.tokenIdentifier)
      )
      .unique()

    const now = Date.now()

    if (existingVote) {
      if (existingVote.pollOptionId !== option._id) {
        await ctx.db.patch(existingVote._id, {
          pollOptionId: option._id
        } as any)
      }
    } else {
      await ctx.db.insert('pollVotes', {
        organizationId: context.organization._id,
        pollId: poll._id,
        pollOptionId: option._id,
        userTokenIdentifier: context.identity.tokenIdentifier,
        createdAt: now
      })
    }

    await ensurePostSubscription(ctx, context.organization._id, context.identity.tokenIdentifier, post._id)
    await ctx.db.patch(post._id, {
      updatedAt: now,
      lastActivityAt: now
    })

    const updated: any = await ctx.db.get(post._id)

    return await buildLegacyPost(ctx, {
      post: updated,
      organization: context.organization,
      viewerMembership: context.viewerMembership,
      viewerTokenIdentifier: context.identity.tokenIdentifier
    })
  }
})

export const getLegacyPollOptionVotersPage = query({
  args: {
    slug: v.string(),
    postId: v.string(),
    pollOptionId: v.string(),
    after: v.optional(v.string()),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)

    if (!context) {
      throw new Error('Organization not found')
    }

    const post = await getPostById(ctx, context.organization._id, args.postId)
    const option = await getPollOptionByPublicId(ctx, args.pollOptionId)

    if (!post || !option) {
      throw new Error('Poll option not found')
    }

    const poll = await getPostPoll(ctx, post._id)

    if (!poll || option.pollId !== poll._id) {
      throw new Error('Poll option not found')
    }

    const [votes, memberships, users] = await Promise.all([
      ctx.db
        .query('pollVotes')
        .withIndex('by_poll_option_id', (query: any) => query.eq('pollOptionId', option._id))
        .collect(),
      ctx.db
        .query('organizationMemberships')
        .withIndex('by_organization_id', (query: any) => query.eq('organizationId', context.organization._id))
        .collect(),
      ctx.db.query('users').collect()
    ])

    const membershipsByTokenIdentifier = new Map(
      memberships.map((membership: any) => [membership.userTokenIdentifier, membership])
    )
    const usersByTokenIdentifier = new Map(users.map((user: any) => [user.tokenIdentifier, user]))

    const voters: any[] = votes
      .map((vote: any) => {
        const membership = membershipsByTokenIdentifier.get(vote.userTokenIdentifier)
        const user = usersByTokenIdentifier.get(vote.userTokenIdentifier)

        if (!membership || !user || membership.discardedAt) {
          return null
        }

        return buildLegacyMemberRecord(membership, user)
      })
      .filter(Boolean) as any[]

    return paginateByCursor(voters, args.after, args.limit)
  }
})

export const createLegacyPostFeedbackRequest = mutation({
  args: {
    slug: v.string(),
    postId: v.string(),
    memberId: v.string()
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)

    if (!context) {
      throw new Error('Organization not found')
    }

    const post = await getPostById(ctx, context.organization._id, args.postId)

    if (!post) {
      throw new Error('Post not found')
    }

    if (post.authorTokenIdentifier !== context.identity.tokenIdentifier) {
      throw new Error('Not allowed to edit this post')
    }

    const targetTitle = post.title || stripHtml(post.descriptionHtml)

    if (post.status !== 'feedback_requested') {
      await ctx.db.patch(post._id, {
        status: 'feedback_requested',
        updatedAt: Date.now(),
        lastActivityAt: Date.now()
      })
    }

    await replacePostFeedbackRequests(ctx, {
      organizationId: context.organization._id,
      postId: post._id,
        memberIds: Array.from(
          new Set([...(await listActivePostFeedbackRequests(ctx, post._id)).map((row: any) => row.organizationMembershipId), args.memberId])
        ),
      actorTokenIdentifier: context.identity.tokenIdentifier,
      targetTitle,
      targetProjectId: post.projectId
    })

    const created = await ctx.db
      .query('postFeedbackRequests')
      .withIndex('by_post_and_membership', (query: any) =>
        query.eq('postId', post._id).eq('organizationMembershipId', args.memberId as any)
      )
      .unique()

    if (!created || created.discardedAt || created.dismissedAt) {
      throw new Error('Feedback request could not be created')
    }

    const [membership, user] = await Promise.all([
      ctx.db.get(created.organizationMembershipId),
      getUserByTokenIdentifier(ctx, created.userTokenIdentifier)
    ])

    if (!membership || !user) {
      throw new Error('Feedback request member not found')
    }

    return {
      id: created.publicId,
      has_replied: !!created.hasReplied,
      member: buildLegacyMemberRecord(membership, user)
    }
  }
})

export const deleteLegacyPostFeedbackRequest = mutation({
  args: {
    slug: v.string(),
    postId: v.string(),
    id: v.string()
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)

    if (!context) {
      throw new Error('Organization not found')
    }

    const post = await getPostById(ctx, context.organization._id, args.postId)
    const feedbackRequest = await getPostFeedbackRequestByPublicId(ctx, args.id)

    if (!post || !feedbackRequest || feedbackRequest.postId !== post._id) {
      throw new Error('Feedback request not found')
    }

    if (post.authorTokenIdentifier !== context.identity.tokenIdentifier) {
      throw new Error('Not allowed to edit this post')
    }

    await ctx.db.patch(feedbackRequest._id, {
      discardedAt: Date.now(),
      updatedAt: Date.now()
    })

    return {}
  }
})

export const dismissLegacyPostFeedbackRequest = mutation({
  args: {
    slug: v.string(),
    postId: v.string(),
    feedbackRequestId: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)

    if (!context) {
      throw new Error('Organization not found')
    }

    const post = await getPostById(ctx, context.organization._id, args.postId)

    if (!post) {
      throw new Error('Post not found')
    }

    let feedbackRequest = args.feedbackRequestId
      ? await getPostFeedbackRequestByPublicId(ctx, args.feedbackRequestId)
      : await ctx.db
          .query('postFeedbackRequests')
          .withIndex('by_post_and_user', (query: any) =>
            query.eq('postId', post._id).eq('userTokenIdentifier', context.identity.tokenIdentifier)
          )
          .unique()

    if (!feedbackRequest || feedbackRequest.postId !== post._id) {
      throw new Error('Feedback request not found')
    }

    const canDismiss =
      feedbackRequest.userTokenIdentifier === context.identity.tokenIdentifier ||
      post.authorTokenIdentifier === context.identity.tokenIdentifier

    if (!canDismiss) {
      throw new Error('Not allowed to dismiss this feedback request')
    }

    const now = Date.now()
    await ctx.db.patch(feedbackRequest._id, {
      dismissedAt: now,
      updatedAt: now
    })

    feedbackRequest = await ctx.db.get(feedbackRequest._id)

    const [membership, user] = await Promise.all([
      ctx.db.get(feedbackRequest.organizationMembershipId),
      getUserByTokenIdentifier(ctx, feedbackRequest.userTokenIdentifier)
    ])

    if (!membership || !user) {
      throw new Error('Feedback request member not found')
    }

    return {
      id: feedbackRequest.publicId,
      has_replied: !!feedbackRequest.hasReplied,
      member: buildLegacyMemberRecord(membership, user)
    }
  }
})

export const deleteLegacyPost = mutation({
  args: {
    slug: v.string(),
    postId: v.string()
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)

    if (!context) {
      throw new Error('Organization not found')
    }

    const post = await getPostById(ctx, context.organization._id, args.postId)

    if (!post) {
      throw new Error('Post not found')
    }

    if (post.authorTokenIdentifier !== context.identity.tokenIdentifier) {
      throw new Error('Not allowed to delete this post')
    }

    const currentVersion = await getPostVersionNumber(ctx, context.organization._id, post)
    const versionChain = await listPostVersionChain(ctx, context.organization._id, post)
    const postsToDelete = versionChain.filter((entry: any) => {
      const candidateVersion = typeof entry.version === 'number' ? entry.version : 1
      return candidateVersion >= currentVersion
    })

    for (const versionPost of postsToDelete) {
      const [comments, poll, feedbackRequests] = await Promise.all([
        getPostComments(ctx, versionPost._id),
        getPostPoll(ctx, versionPost._id),
        ctx.db
          .query('postFeedbackRequests')
          .withIndex('by_post_id', (query: any) => query.eq('postId', versionPost._id))
          .collect()
      ])

      for (const comment of comments) {
        await deleteArtifactsForSubject(ctx, {
          organizationId: context.organization._id,
          subjectType: 'Comment',
          subjectId: comment._id
        })
        await ctx.db.delete(comment._id)
      }

      if (poll) {
        const [options, votes] = await Promise.all([listPollOptions(ctx, poll._id), listPollVotes(ctx, poll._id)])

        for (const vote of votes) {
          await ctx.db.delete(vote._id)
        }

        for (const option of options) {
          await ctx.db.delete(option._id)
        }

        await ctx.db.delete(poll._id)
      }

      for (const feedbackRequest of feedbackRequests) {
        await ctx.db.delete(feedbackRequest._id)
      }

      await deleteArtifactsForSubject(ctx, {
        organizationId: context.organization._id,
        subjectType: 'Post',
        subjectId: versionPost._id
      })
      await deletePostTaggings(ctx, versionPost._id)
      await ctx.db.delete(versionPost._id)
    }

    return {}
  }
})

export const getLegacyPostCommentsPage = query({
  args: {
    slug: v.string(),
    postId: v.string()
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)

    if (!context) {
      throw new Error('Organization not found')
    }

    const post = await getPostById(ctx, context.organization._id, args.postId)

    if (!post) {
      throw new Error('Post not found')
    }

    const comments = await getPostComments(ctx, post._id)
    const topLevel = comments
      .filter((comment: any) => !comment.parentCommentId)
      .sort((a: any, b: any) => b.createdAt - a.createdAt)

    return {
      data: await Promise.all(
        topLevel.map((comment: any) =>
          buildLegacyCommentTree(ctx, {
            comment,
            organization: context.organization,
            viewerMembership: context.viewerMembership,
            viewerTokenIdentifier: context.identity.tokenIdentifier,
            comments
          })
        )
      ),
      next_cursor: null,
      prev_cursor: null,
      total_count: comments.length
    }
  }
})

export const getLegacyPostCanvasComments = query({
  args: {
    slug: v.string(),
    postId: v.string()
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)

    if (!context) {
      throw new Error('Organization not found')
    }

    const comments = await getPostComments(ctx, args.postId)
    const canvasComments = comments.filter((comment: any) => comment.x !== undefined || comment.y !== undefined)

    return await Promise.all(
      canvasComments.map((comment: any) =>
        buildLegacyCommentTree(ctx, {
          comment,
          organization: context.organization,
          viewerMembership: context.viewerMembership,
          viewerTokenIdentifier: context.identity.tokenIdentifier,
          comments
        })
      )
    )
  }
})

export const getLegacyPostTimelineEventsPage = query({
  args: {
    slug: v.string(),
    postId: v.string(),
    after: v.optional(v.string()),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)

    if (!context) {
      throw new Error('Organization not found')
    }

    const post = await getPostById(ctx, context.organization._id, args.postId)

    if (!post) {
      throw new Error('Post not found')
    }

    const events = await getSharedTimelineEventsForSubject(ctx, {
      subjectType: 'Post',
      subjectId: args.postId
    })

    return paginateByCursor(events, args.after, args.limit)
  }
})

export const getLegacyGeneratedPostResolution = query({
  args: {
    slug: v.string(),
    postId: v.string(),
    commentId: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)

    if (!context) {
      throw createError('not_found', 'Organization not found')
    }

    const post = await getPostById(ctx, context.organization._id, args.postId)

    if (!post) {
      throw createError('not_found', 'Post not found')
    }

    const html = await buildGeneratedPostResolutionHtml(ctx, {
      organizationId: context.organization._id,
      post,
      commentId: args.commentId ?? null
    })

    return toGeneratedHtml('success', html)
  }
})

export const getLegacyGeneratedPostTldr = query({
  args: {
    slug: v.string(),
    postId: v.string()
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)

    if (!context) {
      throw createError('not_found', 'Organization not found')
    }

    const post = await getPostById(ctx, context.organization._id, args.postId)

    if (!post) {
      throw createError('not_found', 'Post not found')
    }

    const html = await buildGeneratedPostTldrHtml(ctx, {
      organizationId: context.organization._id,
      post
    })

    return toGeneratedHtml('success', html)
  }
})

export const getLegacyPostVersions = query({
  args: {
    slug: v.string(),
    postId: v.string()
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)

    if (!context) {
      throw new Error('Organization not found')
    }

    const post = await getPostById(ctx, context.organization._id, args.postId)

    if (!post) {
      throw new Error('Post not found')
    }

    const versions = await listPostVersionChain(ctx, context.organization._id, post)

    return await Promise.all(
      versions.map(async (versionPost: any, index: number) => {
        const comments = await getPostComments(ctx, versionPost._id)

        return {
          id: versionPost._id,
          created_at: new Date(versionPost.createdAt).toISOString(),
          published_at: formatDate(versionPost.publishedAt),
          comments_count: comments.length,
          version: index + 1
        }
      })
    )
  }
})

export const getLegacyPostSeoInfo = query({
  args: {
    slug: v.string(),
    postId: v.string()
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)

    if (!context) {
      throw new Error('Organization not found')
    }

    const post = await getPostById(ctx, context.organization._id, args.postId)

    if (!post) {
      throw new Error('Post not found')
    }

    const [attachmentRows, previewRows] = await Promise.all([
      listSubjectAttachments(ctx, {
        subjectType: 'Post',
        subjectId: post._id
      }),
      listStoredPostLinkPreviews(ctx, post._id)
    ])
    const attachments = attachmentRows.length > 0 ? attachmentRows : post.attachments
    const openGraphImageUrl = pickSubjectThumbnailUrl(attachments)
    const latestPreview = [...previewRows].sort((left: any, right: any) => right.updatedAt - left.updatedAt)[0] ?? null
    const openGraphVideoUrl = pickSubjectOpenGraphVideoUrl(attachments)

    return {
      id: post._id,
      seo_title: post.title || `${context.organization.name} post`,
      seo_description: stripHtml(post.descriptionHtml),
      open_graph_image_url: openGraphImageUrl ?? latestPreview?.imageUrl ?? null,
      open_graph_video_url: openGraphVideoUrl
    }
  }
})

export const getLegacyOpenGraphLink = query({
  args: {
    url: v.string()
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query('openGraphLinks').withIndex('by_url', (q: any) => q.eq('url', args.url)).unique()
    const row = existing ?? {
      url: args.url,
      title: getLinkHostLabel(args.url),
      imagePath: undefined,
      faviconPath: undefined
    }

    return {
      url: row.url,
      title: row.title,
      image_url: row.imagePath ? buildLegacyMediaUrl(row.imagePath) ?? row.imagePath : null,
      favicon_url: row.faviconPath ? buildLegacyMediaUrl(row.faviconPath) ?? row.faviconPath : null
    }
  }
})

export const getLegacyPostViewsPage = query({
  args: {
    slug: v.string(),
    postId: v.string(),
    after: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)

    if (!context) {
      throw new Error('Organization not found')
    }

    const post = await getPostById(ctx, context.organization._id, args.postId)

    if (!post) {
      throw new Error('Post not found')
    }

    const [dedicatedViewRows, fallbackViewRows, memberships, users] = await Promise.all([
      listDedicatedPostViews(ctx, args.postId),
      listSubjectViews(ctx, {
        subjectType: 'Post',
        subjectId: args.postId
      }),
      ctx.db
        .query('organizationMemberships')
        .withIndex('by_organization_id', (q: any) => q.eq('organizationId', context.organization._id))
        .collect(),
      ctx.db.query('users').collect()
    ])
    const viewRows = dedicatedViewRows.length > 0 ? dedicatedViewRows : fallbackViewRows

    return {
      data: buildLegacyPostViews(
        viewRows,
        new Map(memberships.map((membership: any) => [membership.userTokenIdentifier, membership])),
        new Map(users.map((user: any) => [user.tokenIdentifier, user])),
        context.identity.tokenIdentifier
      ),
      next_cursor: null,
      prev_cursor: null
    }
  }
})

export const createLegacyPostView = mutation({
  args: {
    slug: v.string(),
    postId: v.string(),
    read: v.boolean(),
    skip_notifications: v.optional(v.boolean()),
    dwell_time: v.optional(v.number()),
    anonymized_ip: v.optional(v.string()),
    user_agent: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)

    if (!context) {
      throw new Error('Organization not found')
    }

    const post = await getPostById(ctx, context.organization._id, args.postId)

    if (!post) {
      throw new Error('Post not found')
    }

    const buildProjectUnreadStatus = async () => {
      if (!post.projectId) {
        return null
      }

      return {
        id: post.projectId,
        unread_for_viewer: await getProjectUnreadForViewer(ctx, {
          organizationId: context.organization._id,
          projectId: post.projectId,
          organizationMembershipId: context.viewerMembership._id,
          viewerTokenIdentifier: context.identity.tokenIdentifier,
          messageThreadId: post.project?.messageThreadId ?? undefined
        })
      }
    }

    const notificationCounts = await buildLegacyUnreadNotificationCounts(ctx, {
      tokenIdentifier: context.identity.tokenIdentifier
    })

    if (!args.read || post.authorTokenIdentifier === context.identity.tokenIdentifier) {
      return {
        view: null,
        notification_counts: notificationCounts,
        project_unread_status: await buildProjectUnreadStatus()
      }
    }

    const [viewRow] = await Promise.all([
      upsertDedicatedPostView(ctx, {
        organizationId: context.organization._id,
        postId: post._id,
        organizationMembershipId: context.viewerMembership?._id,
        userTokenIdentifier: context.identity.tokenIdentifier,
        readAt: Date.now(),
        dwellTime: args.dwell_time
      }),
      upsertSubjectView(ctx, {
        organizationId: context.organization._id,
        subjectType: 'Post',
        subjectId: post._id,
        userTokenIdentifier: context.identity.tokenIdentifier
      })
    ])

    if (args.anonymized_ip) {
      await recordNonMemberPostView(ctx, {
        organizationId: context.organization._id,
        postId: post._id,
        userTokenIdentifier: context.identity.tokenIdentifier,
        anonymizedIp: args.anonymized_ip,
        userAgent: args.user_agent ?? null
      })
    }
    const [membership, user] = await Promise.all([
      getOrganizationMembershipForToken(ctx, context.organization._id, context.identity.tokenIdentifier),
      getUserByTokenIdentifier(ctx, context.identity.tokenIdentifier)
    ])

    return {
      view:
        membership && user && viewRow
          ? {
              id: viewRow._id,
              updated_at: new Date(viewRow.updatedAt).toISOString(),
              member: buildLegacyMemberRecord(membership, user)
            }
          : null,
      notification_counts: notificationCounts,
      project_unread_status: await buildProjectUnreadStatus()
    }
  }
})

export const getLegacyCommentById = query({
  args: {
    slug: v.string(),
    commentId: v.string()
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)

    if (!context) {
      return null
    }

    const comment = await getCommentById(ctx, context.organization._id, args.commentId)

    if (!comment) {
      return null
    }

    const comments = await getPostComments(ctx, comment.postId)

    return await buildLegacyCommentTree(ctx, {
      comment,
      organization: context.organization,
      viewerMembership: context.viewerMembership,
      viewerTokenIdentifier: context.identity.tokenIdentifier,
      comments
    })
  }
})

export const createLegacyPostComment = mutation({
  args: {
    slug: v.string(),
    postId: v.string(),
    body_html: v.optional(v.union(v.string(), v.null())),
    file_id: v.optional(v.union(v.string(), v.null())),
    timestamp: v.optional(v.union(v.number(), v.null())),
    x: v.optional(v.union(v.number(), v.null())),
    y: v.optional(v.union(v.number(), v.null())),
    note_highlight: v.optional(v.union(v.string(), v.null())),
    attachments: v.optional(
      v.array(
        v.object({
          file_path: v.string(),
          file_type: v.string(),
          preview_file_path: v.optional(v.union(v.string(), v.null())),
          name: v.optional(v.union(v.string(), v.null())),
          size: v.optional(v.union(v.number(), v.null())),
          width: v.optional(v.number()),
          height: v.optional(v.number()),
          duration: v.optional(v.number())
        })
      )
    )
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)

    if (!context) {
      throw new Error('Organization not found')
    }

    const post = await getPostById(ctx, context.organization._id, args.postId)

    if (!post) {
      throw new Error('Post not found')
    }

    const now = Date.now()
    const commentId = await ctx.db.insert('comments', {
      organizationId: context.organization._id,
      postId: post._id,
      authorTokenIdentifier: context.identity.tokenIdentifier,
      bodyHtml: args.body_html || '<p></p>',
      attachmentId: args.file_id || undefined,
      timestamp: args.timestamp || undefined,
      x: args.x || undefined,
      y: args.y || undefined,
      noteHighlight: args.note_highlight || undefined,
      attachments: (args.attachments ?? []).map((attachment: any, index: number) => ({
        id: `comment-attachment-${now}-${index}`,
        filePath: attachment.file_path,
        fileType: attachment.file_type,
        previewFilePath: attachment.preview_file_path || undefined,
        name: attachment.name || undefined,
        size: attachment.size || undefined,
        width: attachment.width,
        height: attachment.height,
        duration: attachment.duration
      })),
      createdAt: now,
      updatedAt: now
    })

    await ctx.db.patch(post._id, {
      lastActivityAt: now
    })

    const commentAttachmentsInput = args.attachments ?? []

    for (let index = 0; index < commentAttachmentsInput.length; index += 1) {
      const attachment = commentAttachmentsInput[index]

      await createSubjectAttachment(ctx, {
        organizationId: context.organization._id,
        subjectType: 'Comment',
        subjectId: commentId,
        publicId: `comment-attachment-${now}-${index}`,
        filePath: attachment.file_path,
        fileType: attachment.file_type,
        previewFilePath: attachment.preview_file_path ?? null,
        name: attachment.name ?? null,
        size: attachment.size ?? null,
        width: attachment.width,
        height: attachment.height,
        duration: attachment.duration,
        position: index
      })
    }

    const comments = await getPostComments(ctx, post._id)
    const newComment = await getCommentById(ctx, context.organization._id, commentId)

    if (!newComment) {
      throw new Error('Comment could not be created')
    }

    await ensurePostSubscription(ctx, context.organization._id, context.identity.tokenIdentifier, post._id)
    await markPostFeedbackRequestReplied(ctx, {
      postId: post._id,
      userTokenIdentifier: context.identity.tokenIdentifier
    })

    const targetTitle = post.title || stripHtml(post.descriptionHtml)
    const postSubscriptions = await getPostSubscriptions(ctx, post._id)

    await createNotificationRecord(ctx, {
      organizationId: context.organization._id,
      recipientTokenIdentifier: post.authorTokenIdentifier,
      actorTokenIdentifier: context.identity.tokenIdentifier,
      reason: 'author',
      inboxKey: `post:${post._id}:comment:${newComment._id}`,
      subjectType: 'Comment',
      subjectId: newComment._id,
      targetType: 'Post',
      targetId: post._id,
      targetTitle,
      targetProjectId: post.projectId,
      bodyPreviewPrefix: 'Commented on',
      bodyPreview: stripHtml(newComment.bodyHtml)
    })

    for (const subscription of postSubscriptions) {
      if (subscription.userTokenIdentifier === post.authorTokenIdentifier) {
        continue
      }

      await createNotificationRecord(ctx, {
        organizationId: context.organization._id,
        recipientTokenIdentifier: subscription.userTokenIdentifier,
        actorTokenIdentifier: context.identity.tokenIdentifier,
        reason: 'parent_subscription',
        inboxKey: `post:${post._id}:comment:${newComment._id}:subscriber`,
        subjectType: 'Comment',
        subjectId: newComment._id,
        targetType: 'Post',
        targetId: post._id,
        targetTitle,
        targetProjectId: post.projectId,
        bodyPreviewPrefix: 'Commented on',
        bodyPreview: stripHtml(newComment.bodyHtml)
      })
    }

    return {
      preview_commenters: await getPreviewCommenters(ctx, context.organization._id, comments),
      post_comment: await buildLegacyCommentTree(ctx, {
        comment: newComment,
        organization: context.organization,
        viewerMembership: context.viewerMembership,
        viewerTokenIdentifier: context.identity.tokenIdentifier,
        comments
      }),
      attachment: newComment.attachments[0]
        ? buildLegacyAttachment(newComment.attachments[0], 'Comment', newComment._id, true)
        : null,
      attachment_commenters: newComment.attachmentId
        ? [await buildLegacyMember(ctx, context.organization._id, context.identity.tokenIdentifier)]
        : null
    }
  }
})

export const createLegacyCommentReply = mutation({
  args: {
    slug: v.string(),
    commentId: v.string(),
    body_html: v.optional(v.union(v.string(), v.null())),
    attachments: v.optional(
      v.array(
        v.object({
          file_path: v.string(),
          file_type: v.string(),
          preview_file_path: v.optional(v.union(v.string(), v.null())),
          name: v.optional(v.union(v.string(), v.null())),
          size: v.optional(v.union(v.number(), v.null())),
          width: v.optional(v.number()),
          height: v.optional(v.number()),
          duration: v.optional(v.number())
        })
      )
    )
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)

    if (!context) {
      throw new Error('Organization not found')
    }

    const parentComment = await getCommentById(ctx, context.organization._id, args.commentId)

    if (!parentComment) {
      throw new Error('Comment not found')
    }

    const now = Date.now()
    const replyId = await ctx.db.insert('comments', {
      organizationId: context.organization._id,
      postId: parentComment.postId,
      authorTokenIdentifier: context.identity.tokenIdentifier,
      bodyHtml: args.body_html || '<p></p>',
      parentCommentId: parentComment._id,
      attachments: (args.attachments ?? []).map((attachment: any, index: number) => ({
        id: `reply-attachment-${now}-${index}`,
        filePath: attachment.file_path,
        fileType: attachment.file_type,
        previewFilePath: attachment.preview_file_path || undefined,
        name: attachment.name || undefined,
        size: attachment.size || undefined,
        width: attachment.width,
        height: attachment.height,
        duration: attachment.duration
      })),
      createdAt: now,
      updatedAt: now
    })

    const parentPost = await getPostById(ctx, context.organization._id, parentComment.postId)

    if (parentPost) {
      await ctx.db.patch(parentPost._id, { lastActivityAt: now })
    }

    const replyAttachmentsInput = args.attachments ?? []

    for (let index = 0; index < replyAttachmentsInput.length; index += 1) {
      const attachment = replyAttachmentsInput[index]

      await createSubjectAttachment(ctx, {
        organizationId: context.organization._id,
        subjectType: 'Comment',
        subjectId: replyId,
        publicId: `reply-attachment-${now}-${index}`,
        filePath: attachment.file_path,
        fileType: attachment.file_type,
        previewFilePath: attachment.preview_file_path ?? null,
        name: attachment.name ?? null,
        size: attachment.size ?? null,
        width: attachment.width,
        height: attachment.height,
        duration: attachment.duration,
        position: index
      })
    }

    const comments = await getPostComments(ctx, parentComment.postId)
    const reply = await ctx.db.get(replyId)

    if (!reply) {
      throw new Error('Reply could not be created')
    }

    const noteRow = await getNoteRowByPublicId(ctx, parentComment.postId)
    const targetTitle = parentPost?.title || stripHtml(parentPost?.descriptionHtml) || 'Note'
    const targetType = noteRow ? 'Note' : 'Post'

    if (noteRow) {
      await ensureNoteSubscription(ctx, context.organization._id, context.identity.tokenIdentifier, parentComment.postId)
    } else {
      await ensurePostSubscription(ctx, context.organization._id, context.identity.tokenIdentifier, parentComment.postId)
    }

    const subscriberRows = noteRow
      ? await getNoteSubscriptions(ctx, parentComment.postId)
      : parentPost
        ? await getPostSubscriptions(ctx, parentPost._id)
        : []

    await createNotificationRecord(ctx, {
      organizationId: context.organization._id,
      recipientTokenIdentifier: parentComment.authorTokenIdentifier,
      actorTokenIdentifier: context.identity.tokenIdentifier,
      reason: 'author',
      inboxKey: `comment:${parentComment._id}:reply:${reply._id}`,
      subjectType: 'Comment',
      subjectId: reply._id,
      targetType,
      targetId: parentComment.postId,
      targetTitle,
      targetProjectId: parentPost?.projectId,
      subtargetType: 'Comment',
      subtargetId: parentComment._id,
      bodyPreviewPrefix: 'Replied to',
      bodyPreview: stripHtml(reply.bodyHtml),
      replyToBodyPreview: stripHtml(parentComment.bodyHtml)
    })

    if (parentPost && parentPost.authorTokenIdentifier !== parentComment.authorTokenIdentifier) {
      await createNotificationRecord(ctx, {
        organizationId: context.organization._id,
        recipientTokenIdentifier: parentPost.authorTokenIdentifier,
        actorTokenIdentifier: context.identity.tokenIdentifier,
        reason: 'author',
        inboxKey: `post:${parentPost._id}:comment:${reply._id}`,
        subjectType: 'Comment',
        subjectId: reply._id,
        targetType,
        targetId: parentPost._id,
        targetTitle,
        targetProjectId: parentPost.projectId,
        subtargetType: 'Comment',
        subtargetId: parentComment._id,
        bodyPreviewPrefix: 'Replied to',
        bodyPreview: stripHtml(reply.bodyHtml),
        replyToBodyPreview: stripHtml(parentComment.bodyHtml)
      })
    }

    for (const subscription of subscriberRows) {
      if (
        subscription.userTokenIdentifier === context.identity.tokenIdentifier ||
        subscription.userTokenIdentifier === parentComment.authorTokenIdentifier ||
        subscription.userTokenIdentifier === parentPost?.authorTokenIdentifier
      ) {
        continue
      }

      await createNotificationRecord(ctx, {
        organizationId: context.organization._id,
        recipientTokenIdentifier: subscription.userTokenIdentifier,
        actorTokenIdentifier: context.identity.tokenIdentifier,
        reason: 'parent_subscription',
        inboxKey: `${targetType.toLowerCase()}:${parentComment.postId}:comment:${reply._id}:subscriber`,
        subjectType: 'Comment',
        subjectId: reply._id,
        targetType,
        targetId: parentComment.postId,
        targetTitle,
        targetProjectId: parentPost?.projectId,
        subtargetType: 'Comment',
        subtargetId: parentComment._id,
        bodyPreviewPrefix: 'Replied to',
        bodyPreview: stripHtml(reply.bodyHtml),
        replyToBodyPreview: stripHtml(parentComment.bodyHtml)
      })
    }

    return {
      reply: noteRow
        ? await buildLegacyNoteCommentTree(ctx, {
            comment: reply,
            organization: context.organization,
            viewerMembership: context.viewerMembership,
            viewerTokenIdentifier: context.identity.tokenIdentifier,
            comments
          })
        : await buildLegacyCommentTree(ctx, {
            comment: reply,
            organization: context.organization,
            viewerMembership: context.viewerMembership,
            viewerTokenIdentifier: context.identity.tokenIdentifier,
            comments
          }),
      attachment: reply.attachments[0] ? buildLegacyAttachment(reply.attachments[0], 'Comment', reply._id, true) : null,
      attachment_commenters: null
    }
  }
})

export const updateLegacyComment = mutation({
  args: {
    slug: v.string(),
    commentId: v.string(),
    body_html: v.optional(v.union(v.string(), v.null()))
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)

    if (!context) {
      throw new Error('Organization not found')
    }

    const comment = await getCommentById(ctx, context.organization._id, args.commentId)

    if (!comment) {
      throw new Error('Comment not found')
    }

    if (comment.authorTokenIdentifier !== context.identity.tokenIdentifier) {
      throw new Error('Not allowed to edit this comment')
    }

    await ctx.db.patch(comment._id, {
      bodyHtml: args.body_html || '<p></p>',
      updatedAt: Date.now()
    })

    const updated = await ctx.db.get(comment._id)
    const comments = await getPostComments(ctx, comment.postId)

    return await buildLegacyCommentTree(ctx, {
      comment: updated,
      organization: context.organization,
      viewerMembership: context.viewerMembership,
      viewerTokenIdentifier: context.identity.tokenIdentifier,
      comments
    })
  }
})

export const deleteLegacyComment = mutation({
  args: {
    slug: v.string(),
    commentId: v.string()
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)

    if (!context) {
      throw new Error('Organization not found')
    }

    const comment = await getCommentById(ctx, context.organization._id, args.commentId)

    if (!comment) {
      throw new Error('Comment not found')
    }

    if (comment.authorTokenIdentifier !== context.identity.tokenIdentifier) {
      throw new Error('Not allowed to delete this comment')
    }

    const allComments = await getPostComments(ctx, comment.postId)
    const targetIds = collectCommentDescendantIds(allComments, comment._id)

    for (const id of targetIds) {
      await deleteArtifactsForSubject(ctx, {
        organizationId: context.organization._id,
        subjectType: 'Comment',
        subjectId: id
      })
      await ctx.db.delete(id)
    }

    const remainingComments = (await getPostComments(ctx, comment.postId)).filter(
      (entry: any) => !targetIds.includes(entry._id)
    )
    const preview = await getPreviewCommenters(ctx, context.organization._id, remainingComments)

    const post = await getPostById(ctx, context.organization._id, comment.postId)

    if (post) {
      const updates: Record<string, any> = { lastActivityAt: Date.now() }

      if (post.resolvedCommentId && targetIds.includes(post.resolvedCommentId)) {
        updates.resolvedAt = undefined
        updates.resolvedByMembershipId = undefined
        updates.resolvedHtml = undefined
        updates.resolvedCommentId = undefined
      }

      await ctx.db.patch(post._id, updates)

      if (post.resolvedCommentId && targetIds.includes(post.resolvedCommentId)) {
        await createPostResolutionTimelineEvent(ctx, {
          action: 'post_unresolved',
          organizationId: context.organization._id,
          actorMembershipId: context.viewerMembership._id,
          actorTokenIdentifier: context.identity.tokenIdentifier,
          postId: post._id
        })
      }
    }

    return preview
  }
})

export const getLegacyAttachmentCommenters = query({
  args: {
    slug: v.string(),
    attachmentId: v.string()
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)

    if (!context) {
      throw new Error('Organization not found')
    }

    const comments = await ctx.db
      .query('comments')
      .withIndex('by_attachment_id', (q: any) => q.eq('attachmentId', args.attachmentId))
      .collect()

    const uniqueTokenIdentifiers = comments
      .map((comment: any) => comment.authorTokenIdentifier)
      .filter((tokenIdentifier: string, index: number, list: string[]) => list.indexOf(tokenIdentifier) === index)

    return await Promise.all(
      uniqueTokenIdentifiers.map((tokenIdentifier: string) =>
        buildLegacyMember(ctx, context.organization._id, tokenIdentifier)
      )
    )
  }
})

export const getLegacyAttachmentById = query({
  args: {
    slug: v.string(),
    attachmentId: v.string()
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)

    if (!context) {
      throw new Error('Organization not found')
    }

    const match = await findLegacyAttachment(ctx, context.organization._id, args.attachmentId)

    if (!match) {
      throw new Error('Attachment not found')
    }

    return buildLegacyAttachment(match.attachment, match.subjectType, match.subjectId, match.isSubjectComment)
  }
})

export const getLegacyPostAttachmentCommentsPage = query({
  args: {
    slug: v.string(),
    postId: v.string(),
    attachmentId: v.string(),
    after: v.optional(v.string()),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)

    if (!context) {
      throw new Error('Organization not found')
    }

    const post = await getPostById(ctx, context.organization._id, args.postId)

    if (!post) {
      throw new Error('Post not found')
    }

    const comments = (await getPostComments(ctx, post._id))
      .filter((comment: any) => comment.attachmentId === args.attachmentId)
      .sort((left: any, right: any) => right.createdAt - left.createdAt)
      .slice(0, Math.max(1, Math.min(args.limit ?? 200, 200)))

    return {
      data: await Promise.all(
        comments.map((comment: any) =>
          buildLegacyCommentTree(ctx, {
            comment,
            organization: context.organization,
            viewerMembership: context.viewerMembership,
            viewerTokenIdentifier: context.identity.tokenIdentifier,
            comments
          })
        )
      ),
      next_cursor: null,
      prev_cursor: null,
      total_count: comments.length
    }
  }
})
