# frozen_string_literal: true

require "test_helper"

module Integrations
  module Linear
    class SyncTeamsJobTest < ActiveJob::TestCase
      setup do
        @integration = create(:integration, :linear)
      end

      context "#perform" do
        test "updates teams from first page of results + enqueues job for next page" do
          VCR.use_cassette("linear/teams") do
            updated_team = create(:integration_team, integration: @integration, provider_team_id: "0", name: "old-name")

            assert_difference -> { IntegrationTeam.count }, 1 do
              SyncTeamsJob.new.perform(@integration.id)
            end

            assert_in_delta Time.current, @integration.reload.teams_last_synced_at, 2.seconds
            assert_equal "Frontier Forest", updated_team.reload.name
            assert_enqueued_sidekiq_job(SyncTeamsJob, args: [@integration.id, "1"])
          end
        end

        test "updates teams from last page of results + deletes unfound teams" do
          VCR.configure do |c|
            c.before_playback(:linear_last_page) do |interaction|
              interaction.response.body = "{\"data\":{\"teams\":{\"nodes\":[{\"id\":\"1\",\"name\":\"Deserted Dunes\",\"private\":true,\"key\":\"DUN\"}]}}}"
            end
          end

          Timecop.freeze do
            @integration.find_or_initialize_data(IntegrationData::TEAMS_LAST_SYNCED_AT).update!(value: 3.minutes.ago.iso8601)
            old_team = create(:integration_team, integration: @integration, provider_team_id: "0", updated_at: 4.minutes.ago)
            recently_updated_team = create(:integration_team, integration: @integration, provider_team_id: "1", updated_at: 3.minutes.ago)

            VCR.use_cassette("linear/teams", tag: :linear_last_page) do
              SyncTeamsJob.new.perform(@integration.id, "1")
            end

            assert_not IntegrationTeam.exists?(id: old_team.id)
            assert_equal 1, @integration.teams.count
            assert_equal recently_updated_team.reload.name, "Deserted Dunes"
            assert_equal recently_updated_team.reload.private, true
            refute_enqueued_sidekiq_job(SyncTeamsJob)
          end
        end

        test "does not sync Linear teams if synced in the past 2 minutes" do
          Timecop.travel(1.minute.ago) do
            @integration.teams_synced!
          end

          assert_no_difference -> { IntegrationTeam.count } do
            SyncTeamsJob.new.perform(@integration.id)
          end
        end

        test "retries rate limited errors" do
          Timecop.freeze do
            VCR.configure do |c|
              c.before_playback(:linear_rate_limit) do |interaction|
                interaction.response.status.code = 429
                interaction.response.headers["X-RateLimit-Requests-Reset"] = 30.seconds.from_now.to_i
                interaction.response.body = "{\"errors\":[{\"message\":\"\",\"extensions\":{\"code\":\"RATELIMITED\"}}]}"
              end
            end

            VCR.use_cassette("linear/teams", tag: :linear_rate_limit) do
              SyncTeamsJob.new.perform(@integration.id)
            end

            assert_enqueued_sidekiq_job(SyncTeamsJob, args: [@integration.id, nil], perform_in: 30)
          end
        end
      end
    end
  end
end
