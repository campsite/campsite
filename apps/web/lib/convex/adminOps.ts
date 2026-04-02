import { api } from '../../../../convex/_generated/api'

import { getConvexServerClient } from './server'

export async function createLegacyOrganizationDataExport(accessToken: string, data: { slug: string }) {
  const client = getConvexServerClient(accessToken)

  return await client.mutation(api.adminOps.createLegacyOrganizationDataExport, data)
}

export async function createLegacyViewerDataExport(accessToken: string, data: { slug: string }) {
  const client = getConvexServerClient(accessToken)

  return await client.mutation(api.adminOps.createLegacyViewerDataExport, data)
}

export async function createLegacyProjectDataExport(
  accessToken: string,
  data: {
    slug: string
    projectId: string
  }
) {
  const client = getConvexServerClient(accessToken)

  return await client.mutation(api.adminOps.createLegacyProjectDataExport, data)
}

export async function completeLegacyDataExport(
  accessToken: string,
  data: {
    publicId: string
    zipPath: string
  }
) {
  const client = getConvexServerClient(accessToken)

  return await client.mutation(api.adminOps.completeLegacyDataExport, data)
}

export async function createLegacyFeedback(
  accessToken: string,
  data: {
    slug: string
    description: string
    feedbackType: 'bug' | 'feature' | 'general'
    currentUrl: string
    screenshotPath?: string
    browserInfo?: string
    osInfo?: string
  }
) {
  const client = getConvexServerClient(accessToken)

  return await client.mutation(api.adminOps.createLegacyFeedback, data)
}
