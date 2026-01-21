# frozen_string_literal: true

class UpdateDiscordMessageJob < BaseJob
  queue_as :default

  def perform(discord_event)
    # TODO: Implement Discord message update handling
    # This would typically sync message edits back to Campsite posts
  end
end
