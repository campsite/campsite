import { WEB_URL } from '@campsite/config'

export function toAbsoluteWebUrl(path?: string | null) {
  if (!path) {
    return ''
  }

  if (/^https?:\/\//.test(path)) {
    return path
  }

  return new URL(path, `${WEB_URL}/`).toString()
}

export function normalizeLegacyOrganization<T extends { invitation_url?: string | null } | null | undefined>(organization: T): T {
  if (!organization) {
    return organization
  }

  return {
    ...organization,
    invitation_url: toAbsoluteWebUrl(organization.invitation_url)
  }
}

export function normalizeInvitationUrl<T extends { invitation_url: string }>(payload: T): T {
  return {
    ...payload,
    invitation_url: toAbsoluteWebUrl(payload.invitation_url)
  }
}
