# frozen_string_literal: true

class ResetPostSubscriptionsForProjectJob < BaseJob
  sidekiq_options queue: "background", retry: 3

  def perform(user_id, project_id)
    user = User.find(user_id)
    project = Project.find(project_id)

    if project.subscriptions.find_by(user: user)&.cascade?
      return project.kept_published_posts.each { |post| post.subscriptions.create_or_find_by!(user: user) }
    end

    organization_membership = project.organization.kept_memberships.find_by!(user: user)

    project.kept_published_posts.eager_load(:kept_comments).each do |post|
      if post.participating_or_mentioned?(organization_membership)
        post.subscriptions.create_or_find_by!(user: user)
      else
        post.subscriptions.find_by(user: user)&.destroy!
      end
    end
  end
end
