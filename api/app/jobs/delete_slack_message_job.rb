# frozen_string_literal: true

class DeleteSlackMessageJob < BaseJob
  sidekiq_options queue: "background", retry: 3

  def perform(org_id, slack_channel_id, slack_message_ts)
    org = Organization.find(org_id)
    return unless org.slack_token

    client(org.slack_token).chat_delete({ channel: slack_channel_id, ts: slack_message_ts })
  rescue Slack::Web::Api::Errors::MessageNotFound, Slack::Web::Api::Errors::ChannelNotFound
    # do not retry on message not found errors
  end

  private

  def client(token)
    Slack::Web::Client.new(token: token)
  end
end
