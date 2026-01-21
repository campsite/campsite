# frozen_string_literal: true

class SyncDiscordChannelsJob < BaseJob
  queue_as :default

  def perform(integration)
    return unless integration.discord_integration?

    # Fetch channels from Discord API
    response = HTTP.auth("Bot #{integration.token}")
                  .get("https://discord.com/api/guilds/#{integration.owner.discord_guild_id}/channels")

    return unless response.status.success?

    channels = JSON.parse(response.body)
    
    # Clear existing channels and recreate
    integration.channels.destroy_all

    channels.each do |channel_data|
      next unless channel_data["type"] == 0 # Only text channels

      integration.channels.create!(
        provider_channel_id: channel_data["id"],
        name: channel_data["name"],
        is_private: channel_data["permission_overwrites"].present?
      )
    end

    integration.channels_synced!
  end
end