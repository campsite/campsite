# frozen_string_literal: true

require "test_helper"
require "test_helpers/slack_test_helper"

module SlackEvents
  class HandleMemberLeftChannelJobTest < ActiveJob::TestCase
    include SlackTestHelper

    before(:each) do
      @params = JSON.parse(file_fixture("slack/member_left_channel_event_payload.json").read)
      @channel = create(:integration_channel, provider_channel_id: @params["event"]["channel"])
      @slack_team_id = create(:slack_team_id, organization: @channel.integration.owner, value: @params["team_id"])
      stub_conversations_info(id: @params["event"]["channel"], name: @channel.name, is_private: true)
    end

    context "perform" do
      test "enqueues a SyncSlackChannelMembersJob" do
        HandleMemberLeftChannelJob.new.perform(@params.to_json)

        assert_enqueued_sidekiq_job(SyncSlackChannelMembersJob, args: [@channel.id])
      end
    end
  end
end
