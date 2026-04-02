import { api } from '@/convex/_generated/api'

import { getConvexServerClient } from './server'

export async function getLegacySlackIntegration(accessToken: string, data: { slug: string }) {
  return await getConvexServerClient(accessToken).query(api.externalPlatforms.getLegacySlackIntegration, data)
}

export async function deleteLegacySlackIntegration(accessToken: string, data: { slug: string }) {
  return await getConvexServerClient(accessToken).mutation(api.externalPlatforms.deleteLegacySlackIntegration, data)
}

export async function getLegacySlackChannelsPage(
  accessToken: string,
  data: { slug: string; q?: string; after?: string; limit?: number }
) {
  return await getConvexServerClient(accessToken).query(api.externalPlatforms.getLegacySlackChannelsPage, data)
}

export async function getLegacySlackChannelByProviderId(
  accessToken: string,
  data: { slug: string; providerChannelId: string }
) {
  return await getConvexServerClient(accessToken).query(api.externalPlatforms.getLegacySlackChannelByProviderId, data)
}

export async function createLegacySlackChannelSync(accessToken: string, data: { slug: string }) {
  return await getConvexServerClient(accessToken).mutation(api.externalPlatforms.createLegacySlackChannelSync, data)
}

export async function completeSlackIntegrationCallback(
  accessToken: string,
  data: { slug: string; enableNotifications?: boolean }
) {
  return await getConvexServerClient(accessToken).mutation(api.externalPlatforms.completeSlackIntegrationCallback, data)
}

export async function getLegacyLinearIntegration(accessToken: string, data: { slug: string }) {
  return await getConvexServerClient(accessToken).query(api.externalPlatforms.getLegacyLinearIntegration, data)
}

export async function deleteLegacyLinearIntegration(accessToken: string, data: { slug: string }) {
  return await getConvexServerClient(accessToken).mutation(api.externalPlatforms.deleteLegacyLinearIntegration, data)
}

export async function getLegacyLinearTeams(accessToken: string, data: { slug: string }) {
  return await getConvexServerClient(accessToken).query(api.externalPlatforms.getLegacyLinearTeams, data)
}

export async function createLegacyLinearTeamSync(accessToken: string, data: { slug: string }) {
  return await getConvexServerClient(accessToken).mutation(api.externalPlatforms.createLegacyLinearTeamSync, data)
}

export async function completeLinearIntegrationCallback(accessToken: string, data: { slug: string }) {
  return await getConvexServerClient(accessToken).mutation(api.externalPlatforms.completeLinearIntegrationCallback, data)
}

export async function getLegacyFigmaIntegration(accessToken: string) {
  return await getConvexServerClient(accessToken).query(api.externalPlatforms.getLegacyFigmaIntegration, {})
}

export async function completeFigmaIntegrationCallback(accessToken: string) {
  return await getConvexServerClient(accessToken).mutation(api.externalPlatforms.completeFigmaIntegrationCallback, {})
}

export async function createLegacyFigmaFileAttachmentDetails(
  accessToken: string,
  data: { slug: string; figmaFileUrl: string }
) {
  return await getConvexServerClient(accessToken).mutation(api.externalPlatforms.createLegacyFigmaFileAttachmentDetails, data)
}

export async function getLegacyCalDotComIntegration(accessToken: string) {
  return await getConvexServerClient(accessToken).query(api.externalPlatforms.getLegacyCalDotComIntegration, {})
}

export async function updateLegacyCalDotComOrganization(accessToken: string, data: { organizationId: string }) {
  return await getConvexServerClient(accessToken).mutation(api.externalPlatforms.updateLegacyCalDotComOrganization, data)
}
