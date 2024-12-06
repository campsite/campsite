# frozen_string_literal: true

class SharePostToSlackJob < BaseJob
  sidekiq_options queue: "background"

  def perform(post_id, user_id, slack_channel_id)
    post = Post.find(post_id)
    user = User.find(user_id)
    post_share = PostShare.new(post: post, user: user, slack_channel_id: slack_channel_id)

    post_share.create_slack_message!
  end
end
