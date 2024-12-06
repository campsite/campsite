# frozen_string_literal: true

class CreateCampsiteCommentJob < BaseJob
  sidekiq_options queue: "default", retry: 3

  def perform(post_id, content_markdown, parent_id = nil)
    CampsiteClient.new.create_comment(post_id: post_id, content_markdown: content_markdown, parent_id: parent_id)
  end
end
