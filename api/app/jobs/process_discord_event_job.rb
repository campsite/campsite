# frozen_string_literal: true

class ProcessDiscordEventJob < BaseJob
  queue_as :default

  def perform(discord_event)
    discord_event.process!
  end
end