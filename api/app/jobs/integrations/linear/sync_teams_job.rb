# frozen_string_literal: true

module Integrations
  module Linear
    class SyncTeamsJob < BaseJob
      MINIMUM_DURATION_BETWEEN_SYNCS = 2.minutes

      sidekiq_options queue: "background"

      def perform(integration_id, next_cursor = nil)
        integration = Integration.linear.find_by(id: integration_id)
        return unless integration

        is_first_page = next_cursor.nil?
        if is_first_page
          return if integration.teams_last_synced_at&.after?(MINIMUM_DURATION_BETWEEN_SYNCS.ago)

          integration.teams_synced!
        end

        linear_client ||= LinearClient.new(integration.token)
        response = linear_client.teams.get(next_cursor)

        teams = response.dig("data", "teams", "nodes")
        teams.each do |team_data|
          team = integration.teams.find_or_initialize_by(provider_team_id: team_data["id"])
          team.update!(
            name: team_data["name"],
            private: team_data["private"],
            key: team_data["key"],
          )
          team.touch
        end

        new_next_cursor = response.dig("data", "teams", "pageInfo", "endCursor")
        if new_next_cursor.blank?
          integration.teams.where(updated_at: ..integration.teams_last_synced_at).destroy_all
          return
        end

        SyncTeamsJob.perform_async(integration_id, new_next_cursor)
      rescue LinearClient::RateLimitedError => e
        SyncTeamsJob.perform_in(e.reset_in, integration_id, next_cursor)
      end
    end
  end
end
