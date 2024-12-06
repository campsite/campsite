# frozen_string_literal: true

module SlackEvents
  class HandleGroupDeletedJob < BaseJob
    sidekiq_options queue: "background"

    def perform(payload)
      event = GroupDeleted.new(JSON.parse(payload))
      IntegrationChannel.where(provider_channel_id: event.channel_id).destroy_all
    end
  end
end
