# frozen_string_literal: true

class CreateProjectFromMessageThreadJob < BaseJob
  sidekiq_options queue: "background", retry: 3

  def perform(message_thread_id)
    message_thread = MessageThread
      .eager_load(:oauth_applications, organization_memberships: :user)
      .find(message_thread_id)

    project = message_thread.organization.projects.create!(
      creator: message_thread.owner,
      name: message_thread.title,
      private: true,
      message_thread: message_thread,
    )

    BulkProjectMemberships.new(
      project: project,
      creator_user: message_thread.owner,
      member_user_public_ids: message_thread.organization_memberships.map { |om| om.user.public_id },
    ).create!

    message_thread.oauth_applications.each do |oauth_application|
      project.project_memberships.create!(oauth_application: oauth_application)
    end

    message_thread.favorites.update_all(favoritable_id: project.id, favoritable_type: Project.polymorphic_name)
  end
end
