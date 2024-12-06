# frozen_string_literal: true

class UpdateProjectContributorsCountJob < BaseJob
  sidekiq_options queue: "background"

  def perform(project_id)
    project = Project.find_by(id: project_id)
    return unless project

    project&.update_columns(contributors_count: project.contributors.count)
  end
end
