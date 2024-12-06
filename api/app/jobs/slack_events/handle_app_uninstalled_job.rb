# frozen_string_literal: true

module SlackEvents
  class HandleAppUninstalledJob < BaseJob
    sidekiq_options queue: "background"

    def perform(payload)
      event = AppUninstalled.new(JSON.parse(payload))
      Integration.slack.joins(:data).where({ integration_data: { name: IntegrationData::TEAM_ID, value: event.team_id } }).destroy_all
    end
  end
end
