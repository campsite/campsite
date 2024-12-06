# frozen_string_literal: true

class ProjectUnreadStatusSerializer < ApiSerializer
  api_field :public_id, name: :id
  api_field :unread_for_viewer, type: :boolean do |project, options|
    !!preloads(options, :unread_for_viewer, project.id)
  end

  def self.preload(projects, options)
    member = options[:member]
    ids = projects.map(&:id)
    {
      unread_for_viewer: Project.unread_for_viewer_async(ids, member),
    }
  end
end
