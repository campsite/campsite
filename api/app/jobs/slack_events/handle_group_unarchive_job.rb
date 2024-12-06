# frozen_string_literal: true

module SlackEvents
  class HandleGroupUnarchiveJob < BaseJob
    sidekiq_options queue: "background"

    def perform(payload)
      event = GroupUnarchive.new(JSON.parse(payload))
      IntegrationChannel::CreateOrUpdateAllFromSlackApi.new(slack_channel_id: event.channel_id, slack_team_id: event.team_id).run
    end
  end
end
