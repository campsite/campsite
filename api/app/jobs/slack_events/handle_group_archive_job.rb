# frozen_string_literal: true

module SlackEvents
  class HandleGroupArchiveJob < BaseJob
    sidekiq_options queue: "background"

    def perform(payload)
      event = GroupArchive.new(JSON.parse(payload))
      IntegrationChannel.where(provider_channel_id: event.channel_id).destroy_all
    end
  end
end
