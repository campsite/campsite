import { v } from 'convex/values'

import { mutation, query } from './_generated/server'
import {
  buildLegacyGroupedReactions,
  buildLegacySubjectFollowUps,
  hasLegacyFavorite,
  hasLegacyPostSubscription
} from './engagement'
import { buildLegacyMember as buildLegacyMemberRecord, emptyAvatarUrls } from './legacy'
import { createSubjectAttachment, listSubjectAttachments, listSubjectViews, upsertSubjectView } from './media'
import { createNotificationRecord } from './notifications'
import {
  deleteTimelineEventsForSubject,
  discardActiveProjectPinsForSubject,
  getActiveProjectPinForSubject,
  getSharedTimelineEventsForSubject,
  paginateByCursor
} from './pinsBookmarks'
import { buildWorkspaceState } from './workspace'

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

function buildLegacyPublicOrganization(organization: any, viewerMembership: any) {
  return {
    id: organization._id,
    avatar_url: '',
    avatar_urls: emptyAvatarUrls,
    name: organization.name,
    slug: organization.slug,
    viewer_is_admin: viewerMembership.role === 'admin',
    viewer_can_leave: viewerMembership.role !== 'admin'
  }
}

function buildLegacyProject(projectId?: string) {
  if (!projectId) {
    return defaultProject
  }

  return {
    ...defaultProject,
    id: projectId,
    name: 'Project'
  }
}

function pickAttachmentUrl(filePath: string, previewFilePath?: string) {
  return previewFilePath || filePath
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

function buildLegacyAttachment(
  attachment: any,
  subjectType: 'Post' | 'Comment',
  subjectId: string,
  isSubjectComment: boolean
) {
  const url = pickAttachmentUrl(attachment.filePath, attachment.previewFilePath)
  const flags = buildAttachmentTypeFlags(attachment.fileType)
  const id = attachment.publicId ?? attachment.id

  return {
    id,
    file_type: attachment.fileType,
    url,
    app_url: url,
    download_url: url,
    preview_url: attachment.previewFilePath || null,
    preview_thumbnail_url: attachment.previewFilePath || null,
    image_urls: null,
    ...flags,
    duration: attachment.duration ?? 0,
    width: attachment.width ?? 0,
    height: attachment.height ?? 0,
    subject_type: subjectType,
    name: attachment.name ?? null,
    size: attachment.size ?? null,
    remote_figma_url: null,
    no_video_track: attachment.noVideoTrack ?? false,
    gallery_id: null,
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

async function getPostById(ctx: any, organizationId: any, postId: string) {
  const posts = await ctx.db.query('posts').withIndex('by_organization_id', (q: any) => q.eq('organizationId', organizationId)).collect()

  return posts.find((post: any) => post._id === postId) ?? null
}

async function getCommentById(ctx: any, organizationId: any, commentId: string) {
  const comments = await ctx.db
    .query('comments')
    .withIndex('by_organization_id', (q: any) => q.eq('organizationId', organizationId))
    .collect()

  return comments.find((comment: any) => comment._id === commentId) ?? null
}

async function getPostComments(ctx: any, postId: string) {
  return await ctx.db.query('comments').withIndex('by_post_id', (q: any) => q.eq('postId', postId)).collect()
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
  const [followUps, reactions, favorites, notifications, subscriptions] = await Promise.all([
    ctx.db.query('followUps').withIndex('by_subject', (q: any) => q.eq('subjectType', params.subjectType).eq('subjectId', params.subjectId)).collect(),
    ctx.db.query('reactions').withIndex('by_subject', (q: any) => q.eq('subjectType', params.subjectType).eq('subjectId', params.subjectId)).collect(),
    ctx.db.query('favorites').withIndex('by_favoritable', (q: any) => q.eq('favoritableType', params.subjectType).eq('favoritableId', params.subjectId)).collect(),
    ctx.db.query('notifications').collect(),
    params.subjectType === 'Post'
      ? ctx.db.query('subscriptions').withIndex('by_subject', (q: any) => q.eq('subscribableType', 'Post').eq('subscribableId', params.subjectId)).collect()
      : Promise.resolve([])
  ])

  for (const row of followUps) await ctx.db.delete(row._id)
  for (const row of reactions) await ctx.db.delete(row._id)
  for (const row of favorites) await ctx.db.delete(row._id)
  for (const row of subscriptions as any[]) await ctx.db.delete(row._id)
  for (const row of notifications.filter((notification: any) => notification.subjectId === params.subjectId || notification.targetId === params.subjectId)) {
    await ctx.db.delete(row._id)
  }

  if (params.subjectType === 'Post') {
    await discardActiveProjectPinsForSubject(ctx, {
      organizationId: params.organizationId,
      subjectType: 'Post',
      subjectId: params.subjectId
    })
    await deleteTimelineEventsForSubject(ctx, {
      subjectType: 'Post',
      subjectId: params.subjectId
    })
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
  const commentAttachments = commentAttachmentRows.length > 0 ? commentAttachmentRows : comment.attachments
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
    resolved_at: null,
    resolved_by: null,
    type_name: 'comment',
    subject_type: 'post',
    subject_id: comment.postId,
    url: `/${organization.slug}/posts/${comment.postId}#comment-${comment._id}`,
    viewer_can_resolve: !comment.parentCommentId,
    viewer_can_create_issue: true,
    attachment_id: comment.attachmentId ?? null,
    canvas_preview_url: null,
    attachment_thumbnail_url: commentAttachments[0]?.previewFilePath ?? null,
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
    timeline_events: [],
    resource_mentions: []
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
  const viewerHasCommented = comments.some((comment: any) => comment.authorTokenIdentifier === viewerTokenIdentifier)
  const descriptionText = stripHtml(post.descriptionHtml)
  const path = `/${organization.slug}/posts/${post._id}`
  const [groupedReactions, followUps, viewerHasFavorited, viewerHasSubscribed, activePin, postAttachmentRows, postViewRows, memberships, users] = await Promise.all([
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
    listSubjectViews(ctx, {
      subjectType: 'Post',
      subjectId: post._id
    }),
    ctx.db
      .query('organizationMemberships')
      .withIndex('by_organization_id', (q: any) => q.eq('organizationId', organization._id))
      .collect(),
    ctx.db.query('users').collect()
  ])
  const postAttachments = postAttachmentRows.length > 0 ? postAttachmentRows : post.attachments
  const membershipsByTokenIdentifier = new Map<string, any>(
    memberships.map((membership: any) => [membership.userTokenIdentifier, membership])
  )
  const usersByTokenIdentifier = new Map<string, any>(
    users.map((user: any) => [user.tokenIdentifier, user])
  )
  const legacyPostViews = buildLegacyPostViews(
    postViewRows,
    membershipsByTokenIdentifier,
    usersByTokenIdentifier,
    viewerTokenIdentifier
  )
  const viewerHasViewed = postViewRows.some((row: any) => row.userTokenIdentifier === viewerTokenIdentifier)

  return {
    id: post._id,
    title: post.title,
    is_title_from_description: !post.title,
    created_at: new Date(post.createdAt).toISOString(),
    published_at: formatDate(post.publishedAt),
    published: !post.draft,
    last_activity_at: new Date(post.lastActivityAt).toISOString(),
    comments_count: comments.length,
    resolved_comments_count: 0,
    version: 1,
    path,
    channel_name: `post-${post._id}`,
    views_count: legacyPostViews.length + (viewerHasViewed ? 1 : 0),
    non_member_views_count: 0,
    status: post.status,
    visibility: post.visibility,
    open_graph_image_url: null,
    thumbnail_url: null,
    unfurled_link: post.unfurledLink ?? null,
    description_html: post.descriptionHtml,
    truncated_description_html: post.descriptionHtml,
    is_text_content_truncated: false,
    truncated_description_text: descriptionText,
    url: path,
    type_name: 'post',
    organization: buildLegacyPublicOrganization(organization, viewerMembership),
    attachments: postAttachments.map((attachment: any) => buildLegacyAttachment(attachment, 'Post', post._id, false)),
    links: post.links,
    tags: [],
    poll: null,
    feedback_requests: null,
    follow_ups: followUps,
    member: author,
    resolved_comment: null,
    grouped_reactions: groupedReactions,
    project: buildLegacyProject(post.projectId),
    has_parent: !!post.parentId,
    has_iterations: false,
    viewer_is_organization_member: true,
    viewer_is_author: post.authorTokenIdentifier === viewerTokenIdentifier,
    viewer_has_commented: viewerHasCommented,
    preview_commenters: previewCommenters,
    viewer_feedback_status: 'none',
    viewer_has_subscribed: viewerHasSubscribed || post.authorTokenIdentifier === viewerTokenIdentifier || viewerHasCommented,
    viewer_has_viewed: viewerHasViewed,
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
    project_pin_id: activePin?.publicId ?? null,
    resource_mentions: []
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

export const getLegacyPostsPage = query({
  args: {
    slug: v.string(),
    q: v.optional(v.string()),
    limit: v.optional(v.number()),
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
    let posts = await listOrganizationPosts(ctx, context.organization._id)

    if (args.mode === 'viewer') {
      posts = posts.filter((post: any) => post.authorTokenIdentifier === context.identity.tokenIdentifier)
    }

    if (queryText) {
      posts = posts.filter((post: any) => {
        const haystack = `${post.title} ${stripHtml(post.descriptionHtml)}`.toLowerCase()
        return haystack.includes(queryText)
      })
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
    const posts = sortPosts(
      (await listOrganizationPosts(ctx, context.organization._id)).filter(
        (post: any) => post.authorTokenIdentifier === matchingMembership.userTokenIdentifier
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

    const now = Date.now()
    const parentPost = args.parent_id ? await getPostById(ctx, context.organization._id, args.parent_id) : null
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
      createdAt: now,
      updatedAt: now,
      lastActivityAt: now,
      publishedAt: args.draft ? undefined : now
    })

    const post = await getPostById(ctx, context.organization._id, postId)

    if (!post) {
      throw new Error('Post could not be created')
    }

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

    await ensurePostSubscription(ctx, context.organization._id, context.identity.tokenIdentifier, post._id)

    const projectSubscriptions = await getProjectSubscriptions(ctx, post.projectId)
    const targetTitle = post.title || stripHtml(post.descriptionHtml)

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
    status: v.optional(v.union(v.literal('none'), v.literal('feedback_requested')))
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

    const updated = await ctx.db.get(post._id)

    return await buildLegacyPost(ctx, {
      post: updated,
      organization: context.organization,
      viewerMembership: context.viewerMembership,
      viewerTokenIdentifier: context.identity.tokenIdentifier
    })
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

    const comments = await getPostComments(ctx, post._id)

    for (const comment of comments) {
      await deleteArtifactsForSubject(ctx, {
        organizationId: context.organization._id,
        subjectType: 'Comment',
        subjectId: comment._id
      })
      await ctx.db.delete(comment._id)
    }
    await deleteArtifactsForSubject(ctx, {
      organizationId: context.organization._id,
      subjectType: 'Post',
      subjectId: post._id
    })
    await ctx.db.delete(post._id)

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

    const comments = await getPostComments(ctx, post._id)

    return [
      {
        created_at: new Date(post.createdAt).toISOString(),
        published_at: formatDate(post.publishedAt),
        comments_count: comments.length,
        version: 1
      }
    ]
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

    return {
      id: post._id,
      seo_title: post.title || `${context.organization.name} post`,
      seo_description: stripHtml(post.descriptionHtml),
      open_graph_image_url: null,
      open_graph_video_url: null
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

    const [viewRows, memberships, users] = await Promise.all([
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
    dwell_time: v.optional(v.number())
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

    if (!args.read || post.authorTokenIdentifier === context.identity.tokenIdentifier) {
      return {
        view: null,
        notification_counts: null,
        project_unread_status: post.projectId ? { id: post.projectId, unread_for_viewer: false } : null
      }
    }

    const viewRow = await upsertSubjectView(ctx, {
      organizationId: context.organization._id,
      subjectType: 'Post',
      subjectId: post._id,
      userTokenIdentifier: context.identity.tokenIdentifier
    })
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
      notification_counts: null,
      project_unread_status: post.projectId ? { id: post.projectId, unread_for_viewer: false } : null
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

    const targetTitle = parentPost?.title || stripHtml(parentPost?.descriptionHtml)
    await ensurePostSubscription(ctx, context.organization._id, context.identity.tokenIdentifier, parentComment.postId)
    await createNotificationRecord(ctx, {
      organizationId: context.organization._id,
      recipientTokenIdentifier: parentComment.authorTokenIdentifier,
      actorTokenIdentifier: context.identity.tokenIdentifier,
      reason: 'author',
      inboxKey: `comment:${parentComment._id}:reply:${reply._id}`,
      subjectType: 'Comment',
      subjectId: reply._id,
      targetType: 'Post',
      targetId: parentComment.postId,
      targetTitle,
      targetProjectId: parentPost?.projectId,
      subtargetType: 'Comment',
      subtargetId: parentComment._id,
      bodyPreviewPrefix: 'Replied to',
      bodyPreview: stripHtml(reply.bodyHtml),
      replyToBodyPreview: stripHtml(parentComment.bodyHtml)
    })

    return {
      reply: await buildLegacyCommentTree(ctx, {
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
    const targetIds = [
      comment._id,
      ...allComments
        .filter((entry: any) => entry.parentCommentId === comment._id)
        .map((entry: any) => entry._id)
    ]

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
      await ctx.db.patch(post._id, { lastActivityAt: Date.now() })
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
