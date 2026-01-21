import { v4 as uuid } from 'uuid'

export const useDiscordAuthorizationUrl = ({
  scopes,
  redirectUri,
  guildId
}: {
  scopes: string[]
  redirectUri: string
  guildId?: string | null
}) => {
  const clientId = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID

  if (!clientId) {
    console.error('Discord client ID not configured')
    return null
  }

  const params = new URLSearchParams()

  params.set('client_id', clientId)
  params.set('redirect_uri', redirectUri)
  params.set('response_type', 'code')
  params.set('scope', scopes.join(' '))
  params.set('state', uuid())
  
  // Include guild_id to pre-select the server
  if (guildId) {
    params.set('guild_id', guildId)
  }

  // Discord OAuth2 URL
  return `https://discord.com/api/oauth2/authorize?${params.toString()}`
}