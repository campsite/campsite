# frozen_string_literal: true

require "test_helper"

module SlackEvents
  class HandleAppUninstalledJobTest < ActiveJob::TestCase
    before(:each) do
      @params = JSON.parse(file_fixture("slack/app_uninstalled_event_payload.json").read)
      @integration = create(:integration, :slack)
      @slack_team_id = create(:slack_team_id, integration: @integration, value: @params["team_id"])
    end

    context "perform" do
      test "deletes the Integration record" do
        Slack::Web::Client.any_instance.stubs(:apps_uninstall)

        assert_difference -> { Integration.count }, -1 do
          HandleAppUninstalledJob.new.perform(@params.to_json)
        end

        assert_not Integration.exists?(@integration.id)
      end

      test "no-op if no IntegrationChannel with team ID exists" do
        @slack_team_id.update!(value: "something-else")

        assert_difference -> { Integration.count }, 0 do
          HandleAppUninstalledJob.new.perform(@params.to_json)
        end
      end
    end
  end
end
