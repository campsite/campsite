# frozen_string_literal: true

class SyncDiscordMemberJob < BaseJob
  queue_as :default

  def perform(discord_event, action:)
    # TODO: Implement Discord member sync handling
    # This would handle GUILD_MEMBER_ADD and GUILD_MEMBER_REMOVE events
    # and sync user memberships between Discord and Campsite
  end
end
