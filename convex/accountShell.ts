import { buildLegacyMediaUrl, formatDate } from './legacy'

const DEFAULT_ORGANIZATION_SETTINGS = {
  enforce_two_factor_authentication: 'false'
} as const

export async function getOrganizationSettingsMap(ctx: any, organizationId: any) {
  const rows = await ctx.db
    .query('organizationSettings')
    .withIndex('by_organization_id', (q: any) => q.eq('organizationId', organizationId))
    .collect()

  const settings = { ...DEFAULT_ORGANIZATION_SETTINGS } as Record<string, string>

  for (const row of rows) {
    settings[row.key] = row.value
  }

  return settings
}

export async function upsertOrganizationSetting(ctx: any, organizationId: any, key: string, value: string) {
  const existing = await ctx.db
    .query('organizationSettings')
    .withIndex('by_organization_and_key', (q: any) => q.eq('organizationId', organizationId).eq('key', key))
    .unique()

  const payload = {
    organizationId,
    key,
    value,
    updatedAt: Date.now()
  }

  if (existing) {
    await ctx.db.patch(existing._id, payload)
    return await ctx.db.get(existing._id)
  }

  const id = await ctx.db.insert('organizationSettings', {
    ...payload,
    createdAt: Date.now()
  })

  return await ctx.db.get(id)
}

export async function ensureDefaultOrganizationSettings(ctx: any, organizationId: any) {
  for (const [key, value] of Object.entries(DEFAULT_ORGANIZATION_SETTINGS)) {
    await upsertOrganizationSetting(ctx, organizationId, key, value)
  }
}

export async function getUserPreferencesMap(ctx: any, user: any, defaults?: Record<string, string>) {
  const [userPreferenceRows, genericPreferenceRows] = await Promise.all([
    ctx.db.query('userPreferences').withIndex('by_user_id', (q: any) => q.eq('userId', user._id)).collect(),
    ctx.db
      .query('preferences')
      .withIndex('by_subject', (q: any) => q.eq('subjectType', 'User').eq('subjectId', user._id))
      .collect()
  ])

  const preferences = {
    ...(defaults ?? {}),
    ...(user.preferences ?? {})
  } as Record<string, string>

  for (const row of userPreferenceRows) {
    preferences[row.key] = row.value
  }

  for (const row of genericPreferenceRows) {
    preferences[row.key] = row.value
  }

  return preferences
}

export async function upsertUserPreference(ctx: any, user: any, key: string, value: string, defaults?: Record<string, string>) {
  const [existingUserPreference, existingPreference, mergedPreferences] = await Promise.all([
    ctx.db
      .query('userPreferences')
      .withIndex('by_user_id_and_key', (q: any) => q.eq('userId', user._id).eq('key', key))
      .unique(),
    ctx.db
      .query('preferences')
      .withIndex('by_subject_and_key', (q: any) => q.eq('subjectType', 'User').eq('subjectId', user._id).eq('key', key))
      .unique(),
    getUserPreferencesMap(ctx, user, defaults)
  ])

  const now = Date.now()
  const nextPreferences = {
    ...mergedPreferences,
    [key]: value
  }

  await ctx.db.patch(user._id, {
    preferences: nextPreferences
  })

  if (existingUserPreference) {
    await ctx.db.patch(existingUserPreference._id, { value, updatedAt: now })
  } else {
    await ctx.db.insert('userPreferences', {
      userId: user._id,
      key,
      value,
      createdAt: now,
      updatedAt: now
    })
  }

  if (existingPreference) {
    await ctx.db.patch(existingPreference._id, { value, updatedAt: now })
  } else {
    await ctx.db.insert('preferences', {
      subjectType: 'User',
      subjectId: user._id,
      key,
      value,
      createdAt: now,
      updatedAt: now
    })
  }

  return nextPreferences
}

export async function seedUserPreferences(ctx: any, user: any, defaults: Record<string, string>) {
  const merged = {
    ...defaults,
    ...(user.preferences ?? {})
  }
  const [userPreferenceRows, genericPreferenceRows] = await Promise.all([
    ctx.db.query('userPreferences').withIndex('by_user_id', (q: any) => q.eq('userId', user._id)).collect(),
    ctx.db
      .query('preferences')
      .withIndex('by_subject', (q: any) => q.eq('subjectType', 'User').eq('subjectId', user._id))
      .collect()
  ])
  const userPreferenceKeys = new Set(userPreferenceRows.map((row: any) => row.key))
  const genericPreferenceKeys = new Set(genericPreferenceRows.map((row: any) => row.key))
  const now = Date.now()

  await ctx.db.patch(user._id, {
    preferences: merged,
    updatedAt: now
  })

  for (const [key, value] of Object.entries(merged)) {
    if (!userPreferenceKeys.has(key)) {
      await ctx.db.insert('userPreferences', {
        userId: user._id,
        key,
        value,
        createdAt: now,
        updatedAt: now
      })
    }

    if (!genericPreferenceKeys.has(key)) {
      await ctx.db.insert('preferences', {
        subjectType: 'User',
        subjectId: user._id,
        key,
        value,
        createdAt: now,
        updatedAt: now
      })
    }
  }
}

export async function getLatestMembershipStatusRow(ctx: any, membership: any) {
  if (membership?.latestStatusId) {
    const latest = await ctx.db.get(membership.latestStatusId)

    if (latest) {
      return latest
    }
  }

  const rows = await ctx.db
    .query('organizationMembershipStatuses')
    .withIndex('by_organization_membership_id', (q: any) => q.eq('organizationMembershipId', membership._id))
    .collect()

  return rows.sort((a: any, b: any) => b.updatedAt - a.updatedAt || b.createdAt - a.createdAt)[0] ?? null
}

export function buildLegacyMembershipStatusFromRow(row: any) {
  if (!row) {
    return null
  }

  if (row.expiresAt && row.expiresAt <= Date.now()) {
    return null
  }

  return {
    message: row.message ?? '',
    emoji: row.emoji ?? '',
    expiration_setting: row.expirationSetting ?? 'custom',
    expires_at: formatDate(row.expiresAt),
    pause_notifications: row.pauseNotifications ?? false,
    expires_in: row.expirationSetting ?? 'custom'
  }
}

export async function syncMembershipStatusFields(ctx: any, membershipId: any, row: any | null) {
  await ctx.db.patch(membershipId, {
    latestStatusId: row?._id,
    statusMessage: row?.message,
    statusEmoji: row?.emoji,
    statusExpirationSetting: row?.expirationSetting,
    statusExpiresAt: row?.expiresAt,
    statusPauseNotifications: row?.pauseNotifications
  })
}

export async function upsertOrganizationMembershipStatus(
  ctx: any,
  membership: any,
  args: {
    emoji?: string
    message?: string
    expirationSetting?: string
    expiresAt?: number | null
    pauseNotifications?: boolean
  }
) {
  const existing = await getLatestMembershipStatusRow(ctx, membership)
  const now = Date.now()
  const payload = {
    organizationMembershipId: membership._id,
    message: args.message || '',
    emoji: args.emoji || '',
    expiresAt: args.expiresAt || undefined,
    expirationSetting: args.expirationSetting ?? 'custom',
    pauseNotifications: args.pauseNotifications ?? false,
    updatedAt: now
  }

  let row = existing

  if (existing) {
    await ctx.db.patch(existing._id, payload)
    row = await ctx.db.get(existing._id)
  } else {
    const id = await ctx.db.insert('organizationMembershipStatuses', {
      ...payload,
      createdAt: now
    })
    row = await ctx.db.get(id)
  }

  await syncMembershipStatusFields(ctx, membership._id, row)

  return row
}

export async function clearOrganizationMembershipStatus(ctx: any, membership: any) {
  const latest = await getLatestMembershipStatusRow(ctx, membership)

  if (latest) {
    await ctx.db.delete(latest._id)
  }

  await syncMembershipStatusFields(ctx, membership._id, null)
}

export async function getOrganizationInvitationProjectIds(ctx: any, invitation: any) {
  if (Array.isArray(invitation.projectIds) && invitation.projectIds.length > 0) {
    return invitation.projectIds
  }

  const rows = await ctx.db
    .query('organizationInvitationProjects')
    .withIndex('by_organization_invitation_id', (q: any) => q.eq('organizationInvitationId', invitation._id))
    .collect()

  return rows.map((row: any) => row.projectId)
}

export async function syncOrganizationInvitationProjects(ctx: any, invitationId: any, projectIds: any[]) {
  const existing = await ctx.db
    .query('organizationInvitationProjects')
    .withIndex('by_organization_invitation_id', (q: any) => q.eq('organizationInvitationId', invitationId))
    .collect()

  const next = new Set(projectIds)
  const existingIds = new Set(existing.map((row: any) => row.projectId))

  for (const row of existing) {
    if (!next.has(row.projectId)) {
      await ctx.db.delete(row._id)
    }
  }

  for (const projectId of Array.from(next)) {
    if (!existingIds.has(projectId)) {
      await ctx.db.insert('organizationInvitationProjects', {
        organizationInvitationId: invitationId,
        projectId,
        createdAt: Date.now(),
        updatedAt: Date.now()
      })
    }
  }
}

export async function listSubjectPermissions(ctx: any, subjectType: string, subjectId: string) {
  const rows = await ctx.db
    .query('permissions')
    .withIndex('by_subject', (q: any) => q.eq('subjectType', subjectType).eq('subjectId', subjectId))
    .collect()

  return rows.filter((row: any) => !row.discardedAt)
}

export async function getPermissionByPublicId(ctx: any, permissionId: string) {
  return await ctx.db
    .query('permissions')
    .withIndex('by_public_id', (q: any) => q.eq('publicId', permissionId))
    .unique()
}

export async function upsertSubjectPermission(
  ctx: any,
  params: {
    publicId: string
    subjectType: string
    subjectId: string
    userTokenIdentifier?: string
    oauthApplicationPublicId?: string
    permission: string
  }
) {
  const existing =
    (params.userTokenIdentifier
      ? await ctx.db
          .query('permissions')
          .withIndex('by_subject_and_user', (q: any) =>
            q.eq('subjectType', params.subjectType).eq('subjectId', params.subjectId).eq('userTokenIdentifier', params.userTokenIdentifier)
          )
          .unique()
      : await getPermissionByPublicId(ctx, params.publicId)) ?? null

  const now = Date.now()
  const payload = {
    publicId: params.publicId,
    subjectType: params.subjectType,
    subjectId: params.subjectId,
    userTokenIdentifier: params.userTokenIdentifier,
    oauthApplicationPublicId: params.oauthApplicationPublicId,
    permission: params.permission,
    updatedAt: now,
    discardedAt: undefined
  }

  if (existing) {
    await ctx.db.patch(existing._id, payload)
    return await ctx.db.get(existing._id)
  }

  const id = await ctx.db.insert('permissions', {
    ...payload,
    createdAt: now
  })

  return await ctx.db.get(id)
}

export async function deleteSubjectPermissionByPublicId(ctx: any, permissionId: string) {
  const existing = await getPermissionByPublicId(ctx, permissionId)

  if (!existing) {
    return
  }

  await ctx.db.patch(existing._id, {
    discardedAt: Date.now(),
    updatedAt: Date.now()
  })
}

export async function recordFriendlySlug(ctx: any, params: { slug: string; sluggableType: string; sluggableId: string }) {
  const slug = params.slug.trim()

  if (!slug) {
    return
  }

  const existing = await ctx.db
    .query('friendlyIdSlugs')
    .withIndex('by_slug', (q: any) => q.eq('slug', slug))
    .collect()

  if (existing.some((row: any) => row.sluggableType === params.sluggableType && row.sluggableId === params.sluggableId)) {
    return
  }

  await ctx.db.insert('friendlyIdSlugs', {
    slug,
    sluggableType: params.sluggableType,
    sluggableId: params.sluggableId,
    createdAt: Date.now()
  })
}

export function buildLegacyOrganizationSettings(settings: Record<string, string>) {
  return {
    enforce_two_factor_authentication: settings.enforce_two_factor_authentication === 'true'
  }
}

export function buildFriendlySlugTargetPath(sluggableType: string, sluggableId: string) {
  switch (sluggableType) {
    case 'Organization':
      return `/${sluggableId}`
    case 'User':
      return `/people/${sluggableId}`
    default:
      return buildLegacyMediaUrl(sluggableId) ?? sluggableId
  }
}
