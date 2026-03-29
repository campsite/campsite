export const emptyAvatarUrls = {
  xs: '',
  sm: '',
  base: '',
  lg: '',
  xl: '',
  xxl: ''
}

export function buildLegacyAvatarUrls(value?: string | null) {
  if (!value) {
    return emptyAvatarUrls
  }

  return {
    xs: value,
    sm: value,
    base: value,
    lg: value,
    xl: value,
    xxl: value
  }
}

export function buildLegacyMediaUrl(value?: string | null) {
  return value || null
}

function getViewerTimezone(user: { preferences?: Record<string, string> } | null | undefined) {
  return user?.preferences?.timezone ?? null
}

export function formatDate(value?: number | null) {
  return value ? new Date(value).toISOString() : null
}

export function isNotificationsPaused(user: { notificationPauseExpiresAt?: number | null } | null | undefined) {
  if (!user?.notificationPauseExpiresAt) {
    return false
  }

  return user.notificationPauseExpiresAt > Date.now()
}

export function buildLegacyMembershipStatus(membership: {
  statusMessage?: string
  statusEmoji?: string
  statusExpirationSetting?: '30m' | '1h' | '4h' | 'today' | 'this_week' | 'custom'
  statusExpiresAt?: number
  statusPauseNotifications?: boolean
}) {
  if (!membership.statusMessage && !membership.statusEmoji) {
    return null
  }

  const expirationSetting = membership.statusExpirationSetting ?? 'custom'

  return {
    message: membership.statusMessage ?? '',
    emoji: membership.statusEmoji ?? '',
    expiration_setting: expirationSetting,
    expires_at: formatDate(membership.statusExpiresAt),
    pause_notifications: membership.statusPauseNotifications ?? false,
    expires_in: expirationSetting
  }
}

export function buildLegacyUser(user: any) {
  const avatarUrl = buildLegacyMediaUrl(user.avatarPath ?? user.avatar_url)
  const coverPhotoUrl = buildLegacyMediaUrl(user.coverPhotoPath ?? user.cover_photo_url)

  return {
    id: user._id,
    avatar_url: avatarUrl || '',
    avatar_urls: buildLegacyAvatarUrls(avatarUrl),
    cover_photo_url: coverPhotoUrl,
    email: user.email || '',
    username: user.username,
    display_name: user.displayName,
    system: false,
    integration: false,
    notifications_paused: isNotificationsPaused(user),
    notification_pause_expires_at: formatDate(user.notificationPauseExpiresAt),
    timezone: getViewerTimezone(user),
    logged_in: true,
    type_name: 'user'
  }
}

export function buildLegacyMember(membership: any, user: any) {
  return {
    id: membership._id,
    role: membership.role,
    created_at: new Date(membership.createdAt).toISOString(),
    deactivated: !!membership.discardedAt,
    is_organization_member: true,
    user: buildLegacyUser(user),
    status: buildLegacyMembershipStatus(membership)
  }
}
