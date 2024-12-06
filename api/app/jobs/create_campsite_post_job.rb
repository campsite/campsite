# frozen_string_literal: true

class CreateCampsitePostJob < BaseJob
  sidekiq_options queue: "default", retry: 3

  def perform(title, content_markdown, project_id)
    CampsiteClient.new.create_post(title: title, content_markdown: content_markdown, project_id: project_id)
  end
end
