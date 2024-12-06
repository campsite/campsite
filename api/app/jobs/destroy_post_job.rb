# frozen_string_literal: true

class DestroyPostJob < BaseJob
  sidekiq_options queue: "backfill", retry: 3

  def perform(post_id)
    Post.find(post_id).destroy!
  end
end
