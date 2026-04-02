import { getLegacyProjectsPage } from '@/lib/convex/onboarding'
import { getLegacyOrganizationMemberships } from '@/lib/convex/server'

export async function getDefaultZapierOrg(accessToken: string) {
  const memberships = await getLegacyOrganizationMemberships(accessToken)
  const organization = memberships[0]?.organization

  if (!organization?.slug) {
    throw new Error('not_found:Organization not found')
  }

  return organization
}

export async function getDefaultZapierProject(accessToken: string) {
  const organization = await getDefaultZapierOrg(accessToken)
  const projects = await getLegacyProjectsPage(accessToken, {
    slug: organization.slug,
    limit: 100
  })

  return {
    organization,
    project: projects.data[0] ?? null,
    projects
  }
}
