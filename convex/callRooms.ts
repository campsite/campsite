import { v } from 'convex/values'

import { api, internal } from './_generated/api'
import type { Id } from './_generated/dataModel'
import { mutation, query } from './_generated/server'
import { generateToken, getViewerIdentity, getWorkspaceMemberships } from './workspace'

function createError(message: string, code: string) {
  return new Error(`${code}:${message}`)
}

function defaultCallRoomTitle(params: {
  organizationName: string
  personalDisplayName?: string | null
  source: 'subject' | 'new_call_button' | 'cal_dot_com' | 'personal'
}) {
  if (params.source === 'personal') {
    return params.personalDisplayName ? `${params.personalDisplayName}'s personal call` : 'Personal call'
  }

  if (params.source === 'cal_dot_com') {
    return `${params.organizationName} call`
  }

  return 'Instant call'
}

async function getOrganizationBySlug(ctx: any, slug: string) {
  return await ctx.db
    .query('organizations')
    .withIndex('by_slug', (q: any) => q.eq('slug', slug))
    .unique()
}

async function getContextForOrganization(ctx: any, slug: string) {
  const identity = await getViewerIdentity(ctx)
  const memberships = await getWorkspaceMemberships(ctx, identity.tokenIdentifier)
  const entry = memberships.find((membership: any) => membership.organization?.slug === slug)

  if (!entry?.organization || entry.membership.discardedAt) {
    return null
  }

  const user = await ctx.db
    .query('users')
    .withIndex('by_token_identifier', (q: any) => q.eq('tokenIdentifier', identity.tokenIdentifier))
    .unique()

  if (!user) {
    throw createError('Viewer has not been provisioned', 'not_found')
  }

  return {
    identity,
    organization: entry.organization,
    viewerMembership: entry.membership,
    user
  }
}

async function getCallRoomByPublicId(ctx: any, callRoomId: string) {
  return await ctx.db
    .query('callRooms')
    .withIndex('by_public_id', (q: any) => q.eq('publicId', callRoomId))
    .unique()
}

async function getUserByTokenIdentifier(ctx: any, tokenIdentifier: string) {
  return await ctx.db
    .query('users')
    .withIndex('by_token_identifier', (q: any) => q.eq('tokenIdentifier', tokenIdentifier))
    .unique()
}

async function buildLegacyCallRoomPayload(ctx: any, args: { organization: any; room: any }): Promise<any> {
  const creatorMembership = args.room.creatorMembershipId ? await ctx.db.get(args.room.creatorMembershipId) : null
  const personalMembership = args.room.personalMembershipId ? await ctx.db.get(args.room.personalMembershipId) : null
  const titleMembership = personalMembership ?? creatorMembership
  const titleUser = titleMembership ? await getUserByTokenIdentifier(ctx, titleMembership.userTokenIdentifier) : null
  const [activeCall, callPeerState] = await Promise.all([
    ctx.runQuery((api as any).callsRealtime.getLegacyCallCompatByCallRoomId, {
      slug: args.organization.slug,
      callRoomId: args.room.publicId
    }),
    ctx.runQuery((internal as any).callsRealtime.getLegacyCallPeersByCallRoomId, {
      organizationId: args.organization._id,
      callRoomId: args.room.publicId
    })
  ])

  return {
    id: args.room.publicId,
    channel_name: `call-room-${args.room.publicId}`,
    url: `/${args.organization.slug}/calls/join/${args.room.publicId}`,
    title:
      args.room.title ??
      defaultCallRoomTitle({
        organizationName: args.organization.name,
        personalDisplayName: titleUser?.displayName ?? null,
        source: args.room.source
    }),
    viewer_token: null,
    viewer_can_invite_participants: true,
    active_peers: callPeerState.activePeers,
    peers: callPeerState.peers,
    active_call: activeCall,
    remote_room_id: args.room.remoteRoomId ?? null
  }
}

export const getLegacyCallRoomById = query({
  args: {
    slug: v.string(),
    callRoomId: v.string()
  },
  handler: async (ctx, args) => {
    const [organization, room] = await Promise.all([getOrganizationBySlug(ctx, args.slug), getCallRoomByPublicId(ctx, args.callRoomId)])

    if (!organization || !room || room.organizationId !== organization._id) {
      throw createError('Call room not found', 'not_found')
    }

    return await buildLegacyCallRoomPayload(ctx, { organization, room })
  }
})

export const createLegacyCallRoom = mutation({
  args: {
    slug: v.string(),
    source: v.union(v.literal('subject'), v.literal('new_call_button'), v.literal('cal_dot_com'))
  },
  handler: async (ctx, args) => {
    const context = await getContextForOrganization(ctx, args.slug)

    if (!context) {
      throw createError('Organization not found', 'not_found')
    }

    const now = Date.now()
    const roomId = await ctx.db.insert('callRooms', {
      organizationId: context.organization._id,
      publicId: generateToken().slice(0, 12),
      creatorMembershipId: context.viewerMembership._id,
      title: undefined,
      source: args.source,
      createdAt: now,
      updatedAt: now
    })
    const room = await ctx.db.get(roomId)

    if (!room) {
      throw createError('Call room could not be created', 'unprocessable')
    }

    return await buildLegacyCallRoomPayload(ctx, { organization: context.organization, room })
  }
})

export const getOrCreateLegacyPersonalCallRoom = mutation({
  args: {
    slug: v.string()
  },
  handler: async (ctx, args) => {
    const context = await getContextForOrganization(ctx, args.slug)

    if (!context) {
      throw createError('Organization not found', 'not_found')
    }

    let room = await ctx.db
      .query('callRooms')
      .withIndex('by_organization_and_personal_membership', (q: any) =>
        q.eq('organizationId', context.organization._id).eq('personalMembershipId', context.viewerMembership._id)
      )
      .unique()

    if (!room) {
      const now = Date.now()
      const roomId = await ctx.db.insert('callRooms', {
        organizationId: context.organization._id,
        publicId: generateToken().slice(0, 12),
        creatorMembershipId: context.viewerMembership._id,
        personalMembershipId: context.viewerMembership._id,
        title: `${context.user.displayName}'s personal call`,
        source: 'personal',
        createdAt: now,
        updatedAt: now
      })

      room = await ctx.db.get(roomId)
    }

    if (!room) {
      throw createError('Personal call room could not be created', 'unprocessable')
    }

    return await buildLegacyCallRoomPayload(ctx, { organization: context.organization, room })
  }
})

export const createLegacyCallRoomInvitations = mutation({
  args: {
    slug: v.string(),
    callRoomId: v.string(),
    memberIds: v.array(v.string())
  },
  handler: async (ctx, args) => {
    const context = await getContextForOrganization(ctx, args.slug)

    if (!context) {
      throw createError('Organization not found', 'not_found')
    }

    const room = await getCallRoomByPublicId(ctx, args.callRoomId)

    if (!room || room.organizationId !== context.organization._id) {
      throw createError('Call room not found', 'not_found')
    }

    const memberships = await ctx.db
      .query('organizationMemberships')
      .withIndex('by_organization_id', (q: any) => q.eq('organizationId', context.organization._id))
      .collect()
    const membershipMap = new Map(memberships.map((membership: any) => [membership._id, membership]))
    const now = Date.now()
    const invitedUserIds: string[] = []

    for (const memberId of args.memberIds) {
      const inviteeMembershipId = memberId as Id<'organizationMemberships'>
      const membership = membershipMap.get(inviteeMembershipId)

      if (!membership || membership.discardedAt) {
        continue
      }

      const existingInvitation = await ctx.db
        .query('callRoomInvitations')
        .withIndex('by_call_room_and_invitee', (q: any) =>
          q.eq('callRoomId', room._id).eq('inviteeMembershipId', inviteeMembershipId)
        )
        .unique()

      if (existingInvitation && !existingInvitation.discardedAt) {
        continue
      }

      const inviteeUser = await getUserByTokenIdentifier(ctx, membership.userTokenIdentifier)

      if (!inviteeUser) {
        continue
      }

      invitedUserIds.push(inviteeUser._id)

      if (existingInvitation) {
        await ctx.db.patch(existingInvitation._id, {
          discardedAt: undefined,
          createdAt: now
        })
        continue
      }

      await ctx.db.insert('callRoomInvitations', {
        callRoomId: room._id,
        organizationId: context.organization._id,
        creatorMembershipId: context.viewerMembership._id,
        inviteeMembershipId,
        createdAt: now
      })
    }

    const creatorUser = await getUserByTokenIdentifier(ctx, context.viewerMembership.userTokenIdentifier)
    const callRoomPayload = await buildLegacyCallRoomPayload(ctx, { organization: context.organization, room })

    return {
      invitedUserIds,
      callRoom: callRoomPayload,
      creatorMember: creatorUser
        ? {
            id: context.viewerMembership._id,
            role: context.viewerMembership.role,
            created_at: new Date(context.viewerMembership.createdAt).toISOString(),
            deactivated: false,
            is_organization_member: true,
            user: {
              id: creatorUser._id,
              avatar_url: creatorUser.avatarPath || '',
              avatar_urls: {
                xs: creatorUser.avatarPath || '',
                sm: creatorUser.avatarPath || '',
                base: creatorUser.avatarPath || '',
                lg: creatorUser.avatarPath || '',
                xl: creatorUser.avatarPath || '',
                xxl: creatorUser.avatarPath || ''
              },
              display_name: creatorUser.displayName,
              username: creatorUser.username
            },
            status: null
          }
        : null
    }
  }
})

export const updateLegacyCallRoomRemoteRoomId = mutation({
  args: {
    callRoomId: v.string(),
    remoteRoomId: v.string()
  },
  handler: async (ctx, args) => {
    const room = await getCallRoomByPublicId(ctx, args.callRoomId)

    if (!room) {
      throw createError('Call room not found', 'not_found')
    }

    await ctx.db.patch(room._id, {
      remoteRoomId: args.remoteRoomId,
      updatedAt: Date.now()
    })

    return await ctx.db.get(room._id)
  }
})
