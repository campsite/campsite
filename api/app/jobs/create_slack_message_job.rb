# frozen_string_literal: true

class CreateSlackMessageJob < BaseJob
  sidekiq_options queue: "default", retry: 3

  def perform(id)
    post = Post.find(id)
    return unless post.slackable?

    post.slack_channel_ids.each do |slack_id|
      post.create_slack_message!(slack_id)
    end
  end
end
