import { api } from '@/convex/_generated/api'

import { getConvexServerClient } from './server'

export async function updateLegacyOrganization(
  accessToken: string,
  data: {
    slug: string
    name?: string
    nextSlug?: string
    avatarPath?: string | null
    billingEmail?: string | null
    emailDomain?: string | null
    slackChannelId?: string | null
    slackChannelIsPrivate?: boolean | null
  }
) {
  const client = getConvexServerClient(accessToken)

  return await client.mutation(api.organizationAdmin.updateLegacyOrganization, data)
}

export async function deleteLegacyOrganization(accessToken: string, data: { slug: string }) {
  const client = getConvexServerClient(accessToken)

  return await client.mutation(api.organizationAdmin.deleteLegacyOrganization, data)
}

export async function getLegacyOrganizationMembersPage(
  accessToken: string,
  data: {
    slug: string
    after?: string
    limit?: number
    q?: string
    roles?: ('admin' | 'member' | 'viewer' | 'guest')[]
    status?: 'deactivated'
    order?: {
      by: 'created_at' | 'last_seen_at'
      direction: 'asc' | 'desc'
    }
  }
) {
  const client = getConvexServerClient(accessToken)

  return await client.query(api.organizationAdmin.getLegacyOrganizationMembersPage, data)
}

export async function getLegacyOrganizationMemberByUsername(
  accessToken: string,
  data: {
    slug: string
    username: string
  }
) {
  const client = getConvexServerClient(accessToken)

  return await client.query(api.organizationAdmin.getLegacyOrganizationMemberByUsername, data)
}

export async function getLegacySyncMembers(accessToken: string, data: { slug: string }) {
  const client = getConvexServerClient(accessToken)

  return await client.query(api.organizationAdmin.getLegacySyncMembers, data)
}

export async function updateLegacyOrganizationMemberRole(
  accessToken: string,
  data: {
    slug: string
    membershipId: string
    role: 'admin' | 'member' | 'viewer' | 'guest'
  }
) {
  const client = getConvexServerClient(accessToken)

  return await client.mutation(api.organizationAdmin.updateLegacyOrganizationMemberRole, data)
}

export async function reactivateLegacyOrganizationMember(
  accessToken: string,
  data: {
    slug: string
    membershipId: string
  }
) {
  const client = getConvexServerClient(accessToken)

  return await client.mutation(api.organizationAdmin.reactivateLegacyOrganizationMember, data)
}

export async function deactivateLegacyOrganizationMember(
  accessToken: string,
  data: {
    slug: string
    membershipId: string
  }
) {
  const client = getConvexServerClient(accessToken)

  return await client.mutation(api.organizationAdmin.deactivateLegacyOrganizationMember, data)
}

export async function getLegacyOrganizationMembershipRequestsPage(
  accessToken: string,
  data: {
    slug: string
    after?: string
  }
) {
  const client = getConvexServerClient(accessToken)

  return await client.query(api.organizationAdmin.getLegacyOrganizationMembershipRequestsPage, data)
}

export async function getLegacyMembershipRequest(accessToken: string, data: { slug: string }) {
  const client = getConvexServerClient(accessToken)

  return await client.query(api.organizationAdmin.getLegacyMembershipRequest, data)
}

export async function createLegacyMembershipRequest(accessToken: string, data: { slug: string }) {
  const client = getConvexServerClient(accessToken)

  return await client.mutation(api.organizationAdmin.createLegacyMembershipRequest, data)
}

export async function approveLegacyMembershipRequest(
  accessToken: string,
  data: {
    slug: string
    requestId: string
  }
) {
  const client = getConvexServerClient(accessToken)

  return await client.mutation(api.organizationAdmin.approveLegacyMembershipRequest, data)
}

export async function declineLegacyMembershipRequest(
  accessToken: string,
  data: {
    slug: string
    requestId: string
  }
) {
  const client = getConvexServerClient(accessToken)

  return await client.mutation(api.organizationAdmin.declineLegacyMembershipRequest, data)
}
