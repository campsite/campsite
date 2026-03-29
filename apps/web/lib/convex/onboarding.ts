import { api } from '@/convex/_generated/api'

import { getConvexServerClient } from './server'

export async function getLegacyInvitationUrl(accessToken: string, data: { slug: string }) {
  const client = getConvexServerClient(accessToken)

  return await client.query(api.onboarding.getLegacyInvitationUrl, data)
}

export async function resetLegacyOrganizationInviteToken(accessToken: string, data: { slug: string }) {
  const client = getConvexServerClient(accessToken)

  return await client.mutation(api.onboarding.resetLegacyOrganizationInviteToken, data)
}

export async function getLegacyOrganizationInvitationsPage(
  accessToken: string,
  data: {
    slug: string
    q?: string
    role_counted?: boolean
    after?: string
  }
) {
  const client = getConvexServerClient(accessToken)

  return await client.query(api.onboarding.getLegacyOrganizationInvitationsPage, data)
}

export async function createLegacyOrganizationInvitations(
  accessToken: string,
  data: {
    slug: string
    invitations: {
      email: string
      role: string
      project_ids?: string[]
    }[]
  }
) {
  const client = getConvexServerClient(accessToken)

  return await client.mutation(api.onboarding.createLegacyOrganizationInvitations, data)
}

export async function bulkInviteLegacyOrganizationMembers(
  accessToken: string,
  data: {
    slug: string
    comma_separated_emails: string
    project_id?: string
  }
) {
  const client = getConvexServerClient(accessToken)

  return await client.mutation(api.onboarding.bulkInviteLegacyOrganizationMembers, data)
}

export async function deleteLegacyOrganizationInvitation(
  accessToken: string,
  data: {
    slug: string
    invitationId: string
  }
) {
  const client = getConvexServerClient(accessToken)

  return await client.mutation(api.onboarding.deleteLegacyOrganizationInvitation, data)
}

export async function getLegacyViewerOrganizationInvitations(accessToken: string) {
  const client = getConvexServerClient(accessToken)

  return await client.query(api.onboarding.getLegacyViewerOrganizationInvitations, {})
}

export async function acceptLegacyOrganizationInvitationByToken(accessToken: string, data: { inviteToken: string }) {
  const client = getConvexServerClient(accessToken)

  return await client.mutation(api.onboarding.acceptLegacyOrganizationInvitationByToken, data)
}

export async function getLegacySuggestedOrganizations(accessToken: string) {
  const client = getConvexServerClient(accessToken)

  return await client.query(api.onboarding.getLegacySuggestedOrganizations, {})
}

export async function createLegacyVerifiedDomainMembership(accessToken: string, data: { slug: string }) {
  const client = getConvexServerClient(accessToken)

  return await client.mutation(api.onboarding.createLegacyVerifiedDomainMembership, data)
}

export async function getLegacyPublicOrganizationByToken(accessToken: string | null | undefined, data: { token: string }) {
  const client = getConvexServerClient(accessToken)

  return await client.query(api.onboarding.getLegacyPublicOrganizationByToken, data)
}

export async function joinLegacyOrganizationByToken(
  accessToken: string,
  data: {
    slug: string
    token: string
  }
) {
  const client = getConvexServerClient(accessToken)

  return await client.mutation(api.onboarding.joinLegacyOrganizationByToken, data)
}

export async function getLegacyProjectsPage(
  accessToken: string,
  data: {
    slug: string
    q?: string
    filter?: string
    after?: string
    limit?: number
  }
) {
  const client = getConvexServerClient(accessToken)

  return await client.query(api.onboarding.getLegacyProjectsPage, data)
}

export async function createLegacyProject(
  accessToken: string,
  data: {
    slug: string
    name: string
    description?: string
    accessory?: string
    cover_photo_path?: string
    private?: boolean
    is_default?: boolean | null
    onboarding?: boolean | null
  }
) {
  const client = getConvexServerClient(accessToken)

  return await client.mutation(api.onboarding.createLegacyProject, data)
}

export async function getLegacyProject(accessToken: string, data: { slug: string; projectId: string }) {
  const client = getConvexServerClient(accessToken)

  return await client.query(api.onboarding.getLegacyProjectById, data)
}

export async function updateLegacyProject(
  accessToken: string,
  data: {
    slug: string
    projectId: string
    name?: string
    description?: string
    accessory?: string
    cover_photo_path?: string | null
    private?: boolean
    is_default?: boolean | null
  }
) {
  const client = getConvexServerClient(accessToken)

  return await client.mutation(api.onboarding.updateLegacyProject, data)
}

export async function deleteLegacyProject(accessToken: string, data: { slug: string; projectId: string }) {
  const client = getConvexServerClient(accessToken)

  return await client.mutation(api.onboarding.deleteLegacyProject, data)
}

export async function archiveLegacyProject(accessToken: string, data: { slug: string; projectId: string }) {
  const client = getConvexServerClient(accessToken)

  return await client.mutation(api.onboarding.archiveLegacyProject, data)
}

export async function unarchiveLegacyProject(accessToken: string, data: { slug: string; projectId: string }) {
  const client = getConvexServerClient(accessToken)

  return await client.mutation(api.onboarding.unarchiveLegacyProject, data)
}

export async function getLegacyProjectMemberships(accessToken: string, data: { slug: string }) {
  const client = getConvexServerClient(accessToken)

  return await client.query(api.onboarding.getLegacyProjectMemberships, data)
}

export async function getLegacySyncProjects(accessToken: string, data: { slug: string }) {
  const client = getConvexServerClient(accessToken)

  return await client.query(api.onboarding.getLegacySyncProjects, data)
}

export async function createLegacyOnboardProjects(
  accessToken: string,
  data: {
    slug: string
    general_name: string
    general_accessory?: string
    projects: {
      name: string
      accessory?: string
    }[]
  }
) {
  const client = getConvexServerClient(accessToken)

  return await client.mutation(api.onboarding.createLegacyOnboardProjects, data)
}
