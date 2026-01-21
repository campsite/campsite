# frozen_string_literal: true

class DeleteDiscordMessageJob < BaseJob
  queue_as :default

  def perform(discord_event)
    # TODO: Implement Discord message deletion handling
    # This would typically sync message deletions back to Campsite posts
  end
end
