# frozen_string_literal: true

class SyncDiscordChannelJob < BaseJob
  queue_as :default

  def perform(discord_event, action:)
    # TODO: Implement Discord channel sync handling
    # This would handle CHANNEL_CREATE, CHANNEL_UPDATE, and CHANNEL_DELETE events
    # and sync channel information with Campsite
  end
end
