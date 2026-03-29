import { v } from 'convex/values'

import { query } from './_generated/server'
import { buildWorkspaceState } from './workspace'

function buildNotePath(orgSlug: string, noteId: string) {
  return `/${orgSlug}/notes/${noteId}`
}

function createError(code: string, message: string) {
  return new Error(`${code}:${message}`)
}

export const getLegacyDigestMigration = query({
  args: {
    slug: v.string(),
    digestId: v.string()
  },
  handler: async (ctx, args) => {
    const state = await buildWorkspaceState(ctx)
    const membershipEntry = state.memberships.find((entry: any) => entry.organization?.slug === args.slug)

    if (!membershipEntry?.organization || membershipEntry.membership?.discardedAt) {
      throw createError('not_found', 'Organization not found')
    }

    const digest = await ctx.db
      .query('postDigests')
      .withIndex('by_public_id', (query: any) => query.eq('publicId', args.digestId))
      .unique()
    const digestNotes =
      digest && digest.organizationId === membershipEntry.organization._id
        ? await ctx.db
            .query('postDigestNotes')
            .withIndex('by_post_digest_id', (query: any) => query.eq('postDigestId', digest._id))
            .collect()
        : []
    const digestNote = digestNotes
      .filter((row: any) => !row.discardedAt)
      .sort((left: any, right: any) => left.createdAt - right.createdAt)[0]
    const note =
      (digestNote
        ? await ctx.db.query('notes').withIndex('by_public_id', (query: any) => query.eq('publicId', digestNote.postId)).unique()
        : null) ??
      (await ctx.db
        .query('notes')
        .withIndex('by_organization_and_original_digest_public_id', (query: any) =>
          query.eq('organizationId', membershipEntry.organization._id).eq('originalDigestPublicId', args.digestId)
        )
        .unique())

    return {
      note_url: note ? buildNotePath(membershipEntry.organization.slug, note.publicId) : null
    }
  }
})
