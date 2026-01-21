import { useState } from 'react'
import { Button } from '@campsite/ui/Button'
import { CheckIcon, ExternalLinkIcon, XIcon } from '@heroicons/react/24/outline'
import { useGetCurrentOrganization } from 'hooks/useGetCurrentOrganization'
import { useDiscordAuthorizationUrl } from 'hooks/useDiscordAuthorizationUrl'
import { api } from 'utils/api'
import { toast } from 'react-hot-toast'

export function DiscordIntegration() {
  const { data: currentOrganization } = useGetCurrentOrganization()
  const [isConnecting, setIsConnecting] = useState(false)
  const [isDisconnecting, setIsDisconnecting] = useState(false)

  const { data: integration, refetch } = api.useGetDiscordIntegration({
    orgSlug: currentOrganization?.slug || ''
  })

  const disconnectMutation = api.useDeleteDiscordIntegration()

  // Discord OAuth scopes needed for the integration
  const scopes = [
    'bot',
    'guilds',
    'guilds.channels.read',
    'messages.read',
    'webhook.incoming'
  ]

  const redirectUri = `${window.location.origin}/api/v1/integrations/discord/callback`

  const authorizationUrl = useDiscordAuthorizationUrl({
    scopes,
    redirectUri,
    guildId: integration?.discord_guild_id
  })

  const handleConnect = () => {
    if (!authorizationUrl) {
      toast.error('Discord integration not configured')
      return
    }

    setIsConnecting(true)
    window.location.href = authorizationUrl
  }

  const handleDisconnect = async () => {
    if (!currentOrganization) return

    setIsDisconnecting(true)
    
    try {
      await disconnectMutation.mutateAsync({
        orgSlug: currentOrganization.slug
      })
      
      await refetch()
      toast.success('Discord integration disconnected')
    } catch (error) {
      toast.error('Failed to disconnect Discord integration')
    } finally {
      setIsDisconnecting(false)
    }
  }

  const isConnected = !!integration?.id

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold">Discord Integration</h3>
          <p className="mt-1 text-sm text-gray-500">
            Connect your Discord server to sync messages and notifications with Campsite.
          </p>
        </div>
        
        {isConnected ? (
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-sm text-green-600">
              <CheckIcon className="h-4 w-4" />
              Connected
            </span>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDisconnect}
              disabled={isDisconnecting}
            >
              {isDisconnecting ? 'Disconnecting...' : 'Disconnect'}
            </Button>
          </div>
        ) : (
          <Button
            variant="primary"
            size="sm"
            onClick={handleConnect}
            disabled={isConnecting}
          >
            {isConnecting ? 'Connecting...' : 'Connect Discord'}
          </Button>
        )}
      </div>

      {isConnected && integration && (
        <div className="rounded-lg border bg-gray-50 p-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Server</span>
              <span className="text-sm text-gray-600">{integration.guild_name}</span>
            </div>
            
            {integration.discord_guild_id && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Guild ID</span>
                <span className="font-mono text-xs text-gray-600">
                  {integration.discord_guild_id}
                </span>
              </div>
            )}

            <div className="pt-2">
              <a
                href={`https://discord.com/channels/${integration.discord_guild_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
              >
                Open in Discord
                <ExternalLinkIcon className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      )}

      {isConnected && (
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Channel Mappings</h4>
          <p className="text-sm text-gray-500">
            Map Discord channels to Campsite projects to sync messages between platforms.
          </p>
          
          <DiscordChannelMappings
            orgSlug={currentOrganization?.slug || ''}
            guildId={integration?.discord_guild_id}
          />
        </div>
      )}
    </div>
  )
}

function DiscordChannelMappings({ orgSlug, guildId }: { orgSlug: string; guildId?: string }) {
  const { data: channels } = api.useGetDiscordChannels({
    orgSlug,
    guildId: guildId || ''
  })

  const { data: projects } = api.useGetProjects({ orgSlug })

  if (!channels || !projects) {
    return <div className="text-sm text-gray-500">Loading channels...</div>
  }

  return (
    <div className="space-y-2">
      {channels.map((channel) => (
        <ChannelMapping
          key={channel.id}
          channel={channel}
          projects={projects}
          orgSlug={orgSlug}
        />
      ))}
    </div>
  )
}

function ChannelMapping({ channel, projects, orgSlug }: any) {
  const [selectedProjectId, setSelectedProjectId] = useState(channel.mapped_project_id || '')
  const updateMutation = api.useUpdateDiscordChannelMapping()

  const handleUpdateMapping = async () => {
    try {
      await updateMutation.mutateAsync({
        orgSlug,
        channelId: channel.id,
        projectId: selectedProjectId
      })
      toast.success('Channel mapping updated')
    } catch (error) {
      toast.error('Failed to update channel mapping')
    }
  }

  return (
    <div className="flex items-center gap-2 rounded border p-2">
      <span className="flex-1 text-sm">#{channel.name}</span>
      <select
        value={selectedProjectId}
        onChange={(e) => setSelectedProjectId(e.target.value)}
        className="rounded border px-2 py-1 text-sm"
      >
        <option value="">No mapping</option>
        {projects.map((project: any) => (
          <option key={project.id} value={project.id}>
            {project.name}
          </option>
        ))}
      </select>
      <Button
        size="sm"
        variant="secondary"
        onClick={handleUpdateMapping}
        disabled={updateMutation.isLoading}
      >
        Save
      </Button>
    </div>
  )
}