# frozen_string_literal: true

class ProjectSerializer < ApiSerializer
  api_field :public_id, name: :id
  api_field :name
  api_field :description, nullable: true
  api_field :created_at
  api_field :archived_at, nullable: true
  api_field :archived?, name: :archived, type: :boolean
  api_field :last_activity_at
  api_field :slack_channel_id, nullable: true
  api_field :posts_count, type: :number
  api_field :cover_photo_url, nullable: true
  api_field :url
  api_field :accessory, nullable: true
  api_field :private, type: :boolean
  api_field :personal, type: :boolean
  api_field :is_general, type: :boolean
  api_field :is_default, type: :boolean do |project|
    project.is_default || false
  end
  api_field :contributors_count, type: :number
  api_field :members_and_guests_count, type: :number
  api_field :members_count, type: :number
  api_field :guests_count, type: :number
  api_field :call_room_url, nullable: true

  api_field :message_thread_id, type: :string, nullable: true do |project|
    project.message_thread&.public_id
  end

  api_field :organization_id do |project|
    project.organization.public_id
  end

  api_field :viewer_has_favorited, type: :boolean do |project, options|
    !!preloads(options, :viewer_has_favorited, project.id)
  end

  api_field :viewer_can_archive, type: :boolean do |project, options|
    next false unless options[:member]

    !project.is_general? && options[:member].role_has_permission?(resource: Role::PROJECT_RESOURCE, permission: Role::ARCHIVE_ANY_ACTION)
  end

  api_field :viewer_can_destroy, type: :boolean do |project, options|
    next false unless options[:member]

    !project.is_general? && options[:member].role_has_permission?(resource: Role::PROJECT_RESOURCE, permission: Role::DESTROY_ANY_ACTION)
  end

  api_field :viewer_can_unarchive, type: :boolean do |_, options|
    next false unless options[:member]

    options[:member].role_has_permission?(resource: Role::PROJECT_RESOURCE, permission: Role::UNARCHIVE_ANY_ACTION)
  end

  api_field :viewer_can_update, type: :boolean do |_, options|
    next false unless options[:member]

    options[:member].role_has_permission?(resource: Role::PROJECT_RESOURCE, permission: Role::UPDATE_ANY_ACTION)
  end

  api_field :viewer_has_subscribed, type: :boolean do |project, options|
    !!preloads(options, :viewer_subscription, project.id)
  end

  api_field :viewer_subscription, type: :string, enum: ["posts_and_comments", "new_posts", "none"] do |project, options|
    subscription = preloads(options, :viewer_subscription, project.id)
    next "none" unless subscription

    subscription.cascade? ? "posts_and_comments" : "new_posts"
  end

  api_field :viewer_is_member, type: :boolean do |project, options|
    !!preloads(options, :viewer_is_member, project.id)
  end

  api_field :unread_for_viewer, type: :boolean do |project, options|
    !!preloads(options, :unread_for_viewer, project.id)
  end

  api_association :slack_channel, blueprint: SlackChannelSerializer, is_array: false, nullable: true

  api_normalize "project"

  api_association :viewer_display_preferences, blueprint: ProjectDisplayPreferenceSerializer, nullable: true do |project, options|
    preloads(options, :display_preferences, project.id)
  end

  api_association :display_preferences, blueprint: ProjectDisplayPreferenceSerializer do |project|
    project
  end

  def self.preload(projects, options)
    member = options[:member]
    ids = projects.map(&:id)
    {
      viewer_has_favorited: Project.viewer_has_favorited_async(ids, member),
      viewer_subscription: Project.viewer_subscription_async(ids, member),
      viewer_is_member: Project.viewer_is_member_async(ids, member),
      unread_for_viewer: Project.unread_for_viewer_async(ids, member),
      display_preferences: Project.display_preferences_async(ids, member),
    }
  end
end
