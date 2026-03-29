import slugify from 'slugify'

import { WEB_URL } from '@campsite/config'
import { CurrentUser, Organization, PublicOrganizationMembership, UserPreferences } from '@campsite/types'

interface WorkOSLikeUser {
  id?: string
  email?: string | null
  firstName?: string | null
  lastName?: string | null
}

const emptyAvatarUrls = {
  xs: '',
  sm: '',
  base: '',
  lg: '',
  xl: '',
  xxl: ''
}

const defaultPreferences: UserPreferences = {
  email_notifications: 'enabled',
  feature_tip_calls_index_integrations: 'false',
  feature_tip_drafts: 'false',
  feature_tip_figma_plugin: 'false',
  feature_tip_interstitial: 'false',
  feature_tip_note_attachment: 'false',
  feature_tip_onboard_install_apps: 'false',
  home_display_attachments: 'true',
  home_display_comments: 'true',
  home_display_reactions: 'true',
  home_display_resolved: 'true',
  layout: 'feed',
  message_email_notifications: 'enabled',
  notes_layout: 'list',
  posts_density: 'comfortable',
  prefers_desktop_app: 'disabled',
  theme: 'system'
}

function fallbackName(user: WorkOSLikeUser) {
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim()

  if (fullName) {
    return fullName
  }

  if (user.email) {
    return user.email.split('@')[0]
  }

  return 'Campsite User'
}

function fallbackUsername(user: WorkOSLikeUser) {
  const base = user.email?.split('@')[0] || fallbackName(user)

  return slugify(base, { lower: true, strict: true, trim: true }) || 'user'
}

export function getOrganizationSlugForUser(user: WorkOSLikeUser) {
  const base = user.email?.split('@')[0] || fallbackName(user)
  const slug = slugify(base, { lower: true, strict: true, trim: true })

  return slug || 'workspace'
}

export function getDisplayNameForUser(user: WorkOSLikeUser) {
  return fallbackName(user)
}

export function getUsernameForUser(user: WorkOSLikeUser) {
  return fallbackUsername(user)
}

export function getDefaultPreferences() {
  return defaultPreferences
}

export function buildCurrentUser(user: WorkOSLikeUser | null): CurrentUser {
  if (!user) {
    return {
      avatar_url: '',
      avatar_urls: emptyAvatarUrls,
      channel_name: '',
      cover_photo_url: null,
      created_at: null,
      display_name: '',
      email: '',
      email_confirmed: false,
      features: [],
      id: '',
      integration: false,
      logged_in: false,
      managed: false,
      notification_pause_expires_at: null,
      notifications_paused: false,
      on_call: false,
      onboarded_at: null,
      preferences: defaultPreferences,
      staff: false,
      system: false,
      timezone: null,
      two_factor_enabled: null,
      unconfirmed_email: null,
      username: ''
    }
  }

  const username = fallbackUsername(user)
  const displayName = fallbackName(user)

  return {
    avatar_url: '',
    avatar_urls: emptyAvatarUrls,
    channel_name: `private-user-${user.id || username}`,
    cover_photo_url: null,
    created_at: null,
    display_name: displayName,
    email: user.email || '',
    email_confirmed: true,
    features: ['my_work'],
    id: user.id || username,
    integration: false,
    logged_in: true,
    managed: false,
    notification_pause_expires_at: null,
    notifications_paused: false,
    on_call: false,
    onboarded_at: new Date().toISOString(),
    preferences: defaultPreferences,
    staff: false,
    system: false,
    timezone: null,
    two_factor_enabled: false,
    unconfirmed_email: null,
    username
  }
}

export function buildOrganization(user: WorkOSLikeUser): Organization {
  const slug = getOrganizationSlugForUser(user)
  const name = `${fallbackName(user)}'s workspace`

  return {
    avatar_url: '',
    avatar_urls: emptyAvatarUrls,
    channel_name: `org-${slug}`,
    created_at: new Date().toISOString(),
    email_domain: user.email?.split('@')[1] || null,
    features: ['my_work'],
    id: `org_${slug}`,
      invitation_url: `${WEB_URL}/join/${slug}`,
    limits: {
      file_size_bytes: null
    },
    member_count: 1,
    name,
    onboarded_at: new Date().toISOString(),
    paid: false,
    plan_name: 'Starter',
    presence_channel_name: `presence-org-${slug}`,
    settings: {
      enforce_two_factor_authentication: false
    },
    show_upgrade_banner: false,
    slug,
    trial_active: false,
    trial_days_remaining: null,
    trial_expired: false,
    viewer_can_create_custom_reaction: false,
    viewer_can_create_digest: false,
    viewer_can_create_invitation: true,
    viewer_can_create_note: true,
    viewer_can_create_project: true,
    viewer_can_create_tag: false,
    viewer_can_leave: false,
    viewer_can_manage_integrations: false,
    viewer_can_post: true,
    viewer_can_see_new_project_button: true,
    viewer_can_see_people_index: true,
    viewer_can_see_projects_index: true,
    viewer_is_admin: true,
    viewer_member_id: `membership_${slug}`
  }
}

export function buildOrganizationMemberships(user: WorkOSLikeUser): PublicOrganizationMembership[] {
  const organization = buildOrganization(user)

  return [
    {
      id: `membership_${organization.slug}`,
      last_viewed_posts_at: new Date().toISOString(),
      organization: {
        avatar_url: organization.avatar_url,
        avatar_urls: organization.avatar_urls,
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
        viewer_can_leave: organization.viewer_can_leave,
        viewer_is_admin: organization.viewer_is_admin
      }
    }
  ]
}

export function buildEmptyPostPage() {
  return {
    data: [],
    next_cursor: null,
    prev_cursor: null
  }
}
