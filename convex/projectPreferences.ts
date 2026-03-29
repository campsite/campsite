import { v } from 'convex/values'

import { internalQuery } from './_generated/server'

export const projectDisplayPreferenceValidator = v.object({
  display_reactions: v.boolean(),
  display_attachments: v.boolean(),
  display_comments: v.boolean(),
  display_resolved: v.boolean()
})

export const defaultProjectDisplayPreferences = {
  display_reactions: true,
  display_attachments: true,
  display_comments: true,
  display_resolved: true
} as const

export function buildLegacyProjectDisplayPreferences(
  source?:
    | {
        display_reactions?: boolean | null
        display_attachments?: boolean | null
        display_comments?: boolean | null
        display_resolved?: boolean | null
      }
    | {
        displayReactions?: boolean | null
        displayAttachments?: boolean | null
        displayComments?: boolean | null
        displayResolved?: boolean | null
      }
    | null
) {
  const raw = source as any

  return {
    display_reactions: raw?.display_reactions ?? raw?.displayReactions ?? defaultProjectDisplayPreferences.display_reactions,
    display_attachments:
      raw?.display_attachments ?? raw?.displayAttachments ?? defaultProjectDisplayPreferences.display_attachments,
    display_comments: raw?.display_comments ?? raw?.displayComments ?? defaultProjectDisplayPreferences.display_comments,
    display_resolved: raw?.display_resolved ?? raw?.displayResolved ?? defaultProjectDisplayPreferences.display_resolved
  }
}

export async function getProjectDisplayPreferenceRecord(
  ctx: any,
  params: {
    projectId: any
    organizationMembershipId?: any
  }
) {
  if (!params.organizationMembershipId) {
    return null
  }

  return await ctx.db
    .query('projectDisplayPreferences')
    .withIndex('by_project_and_membership', (q: any) =>
      q.eq('projectId', params.projectId).eq('organizationMembershipId', params.organizationMembershipId)
    )
    .unique()
}

export async function upsertProjectDisplayPreference(
  ctx: any,
  params: {
    organizationId: any
    projectId: any
    organizationMembershipId: any
    display_reactions: boolean
    display_attachments: boolean
    display_comments: boolean
    display_resolved: boolean
  }
) {
  const existing = await getProjectDisplayPreferenceRecord(ctx, params)
  const updates = {
    displayReactions: params.display_reactions,
    displayAttachments: params.display_attachments,
    displayComments: params.display_comments,
    displayResolved: params.display_resolved,
    updatedAt: Date.now()
  }

  if (existing) {
    await ctx.db.patch(existing._id, updates)
    return (await ctx.db.get(existing._id)) || { ...existing, ...updates }
  }

  const preferenceId = await ctx.db.insert('projectDisplayPreferences', {
    organizationId: params.organizationId,
    projectId: params.projectId,
    organizationMembershipId: params.organizationMembershipId,
    ...updates,
    createdAt: Date.now()
  })

  return await ctx.db.get(preferenceId)
}

export async function deleteProjectDisplayPreference(
  ctx: any,
  params: {
    projectId: any
    organizationMembershipId?: any
  }
) {
  const existing = await getProjectDisplayPreferenceRecord(ctx, params)

  if (existing) {
    await ctx.db.delete(existing._id)
  }
}

export const getProjectDisplayPreferenceRecordInternal = internalQuery({
  args: {
    projectId: v.id('projects'),
    organizationMembershipId: v.optional(v.id('organizationMemberships'))
  },
  handler: async (ctx, args) => {
    return await getProjectDisplayPreferenceRecord(ctx, args)
  }
})
