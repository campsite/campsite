# frozen_string_literal: true

require "test_helper"

class DeleteSlackMessageJobTest < ActiveJob::TestCase
  context "perform" do
    test "deletes a slack message" do
      integration = create(:integration, provider: :slack, token: "slack-token")
      org = integration.owner
      message_ts = "slack-message-ts"
      channel_id = "slack-channel-id"
      Slack::Web::Client.any_instance.expects(:chat_delete).with({
        channel: channel_id,
        ts: message_ts,
      })

      DeleteSlackMessageJob.new.perform(org.id, channel_id, message_ts)
    end

    test "does not raise on Slack::Web::Api::Errors::MessageNotFound errors" do
      integration = create(:integration, provider: :slack, token: "slack-token")
      org = integration.owner
      message_ts = "slack-message-ts"
      channel_id = "slack-channel-id"
      Slack::Web::Client.any_instance.expects(:chat_delete).with({
        channel: channel_id,
        ts: message_ts,
      }).raises(Slack::Web::Api::Errors::MessageNotFound.new("something went wrong"))

      assert_nothing_raised do
        DeleteSlackMessageJob.new.perform(org.id, channel_id, message_ts)
      end
    end

    test "does not raise on Slack::Web::Api::Errors::ChannelNotFound errors" do
      integration = create(:integration, provider: :slack, token: "slack-token")
      org = integration.owner
      message_ts = "slack-message-ts"
      channel_id = "slack-channel-id"
      Slack::Web::Client.any_instance.expects(:chat_delete).with({
        channel: channel_id,
        ts: message_ts,
      }).raises(Slack::Web::Api::Errors::ChannelNotFound.new("something went wrong"))

      assert_nothing_raised do
        DeleteSlackMessageJob.new.perform(org.id, channel_id, message_ts)
      end
    end
  end
end
