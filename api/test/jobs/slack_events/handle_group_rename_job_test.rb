# frozen_string_literal: true

require "test_helper"

module SlackEvents
  class HandleGroupRenameJobTest < ActiveJob::TestCase
    before(:each) do
      @params = JSON.parse(file_fixture("slack/group_rename_event_payload.json").read)
      @organization = create(:organization)
      @slack_team_id = create(:slack_team_id, organization: @organization, value: @params["team_id"])
      @channel = create(:integration_channel, integration: @organization.slack_integration, provider_channel_id: @params["event"]["channel"]["id"])
    end

    context "perform" do
      test "updates the IntegrationChannel record" do
        HandleGroupRenameJob.new.perform(@params.to_json)

        assert_equal @params["event"]["channel"]["name"], @channel.reload.name
      end
    end
  end
end
