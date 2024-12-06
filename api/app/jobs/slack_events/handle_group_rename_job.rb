# frozen_string_literal: true

module SlackEvents
  class HandleGroupRenameJob < BaseJob
    sidekiq_options queue: "background"

    def perform(payload)
      event = GroupRename.new(JSON.parse(payload))
      IntegrationChannel.where(provider_channel_id: event.channel_id).update_all(name: event.channel_name)
    end
  end
end
