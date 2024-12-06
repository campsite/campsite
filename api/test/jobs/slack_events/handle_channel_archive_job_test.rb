# frozen_string_literal: true

require "test_helper"

module SlackEvents
  class HandleChannelArchiveJobTest < ActiveJob::TestCase
    before(:each) do
      @params = JSON.parse(file_fixture("slack/channel_archive_event_payload.json").read)
      @organization = create(:organization)
      @slack_team_id = create(:slack_team_id, organization: @organization, value: @params["team_id"])
      @channel = create(:integration_channel, integration: @organization.slack_integration, provider_channel_id: @params["event"]["channel"])
    end

    context "perform" do
      test "deletes the IntegrationChannel record and removes references" do
        project = create(:project, slack_channel_id: @channel.provider_channel_id)

        assert_difference -> { @organization.slack_channels.count }, -1 do
          HandleChannelArchiveJob.new.perform(@params.to_json)
        end

        assert_not @organization.slack_channels.exists?(@channel.id)
        assert_nil project.reload.slack_channel_id
      end

      test "no-op if no IntegrationChannel with ID exists" do
        @channel.destroy!

        assert_difference -> { IntegrationChannel.count }, 0 do
          HandleChannelArchiveJob.new.perform(@params.to_json)
        end
      end
    end
  end
end
