# frozen_string_literal: true

class SyncProjectSerializer < ApiSerializer
  api_field :public_id, name: :id
  api_field :name
  api_field :accessory, nullable: true
  api_field :private, type: :boolean
  api_field :is_general, type: :boolean
  api_field :archived?, name: :archived, type: :boolean
  api_field :guests_count, type: :number

  api_field :message_thread_id, type: :string, nullable: true do |project|
    project.message_thread&.public_id
  end

  api_field :recent_posts_count, type: :number, default: 0 do |project, options|
    preloads(options, :viewer_recent_posts_count, project.id)
  end

  def self.preload(projects, options)
    member = options[:member]
    ids = projects.map(&:id)
    {
      viewer_recent_posts_count: Project.viewer_recent_posts_count_async(ids, member),
    }
  end
end
