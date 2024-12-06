export const SLACK_NOTIFICATION_SCOPES = ['im:write', 'chat:write']

export const ALL_SLACK_SCOPES = [
  ...SLACK_NOTIFICATION_SCOPES,
  'channels:join',
  'channels:read',
  'chat:write',
  'links:read',
  'links:write',
  'team:read',
  'groups:read'
]
