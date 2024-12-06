# frozen_string_literal: true

require "test_helper"
require "test_helpers/slack_test_helper"

module SlackEvents
  class HandleMemberJoinedChannelJobTest < ActiveJob::TestCase
    include SlackTestHelper

    before(:each) do
      @params = JSON.parse(file_fixture("slack/member_joined_channel_event_payload.json").read)
      @organization = create(:organization)
      @slack_team_id = create(:slack_team_id, organization: @organization, value: @params["team_id"])
      @slack_channel_name = "my cool channel"
      stub_conversations_info(id: @params["event"]["channel"], name: @slack_channel_name, is_private: true)
    end

    context "perform" do
      test "creates a new private IntegrationChannel" do
        assert_difference -> { @organization.slack_channels.count }, 1 do
          HandleMemberJoinedChannelJob.new.perform(@params.to_json)
        end

        channel = @organization.slack_channels.find_by!(provider_channel_id: @params["event"]["channel"])
        assert_equal @slack_channel_name, channel.name
        assert_predicate channel, :private?
        assert_enqueued_sidekiq_job(SyncSlackChannelMembersJob, args: [channel.id])
      end

      test "does not create a new IntegrationChannel when no organization with the Slack team_id exists" do
        @organization.destroy!

        assert_difference -> { IntegrationChannel.count }, 0 do
          HandleMemberJoinedChannelJob.new.perform(@params.to_json)
        end
      end

      test "does not create a new IntegrationChannel when one with the channel ID already exists" do
        create(:integration_channel, integration: @organization.slack_integration, provider_channel_id: @params["event"]["channel"])

        assert_difference -> { IntegrationChannel.count }, 0 do
          HandleMemberJoinedChannelJob.new.perform(@params.to_json)
        end
      end

      test "no-ops if channel no longer exists" do
        Slack::Web::Client.any_instance.stubs(:conversations_info).raises(Slack::Web::Api::Errors::ChannelNotFound.new("channel_not_found"))

        assert_difference -> { IntegrationChannel.count }, 0 do
          HandleMemberJoinedChannelJob.new.perform(@params.to_json)
        end
      end
    end
  end
end
