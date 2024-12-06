# frozen_string_literal: true

class MessageThreadSerializer < ApiSerializer
  api_field :public_id, name: :id
  api_field :last_message_at, nullable: true
  api_field :latest_message_truncated, nullable: true do |thread, opts|
    thread.latest_message_truncated(viewer: opts[:member])
  end
  api_field :image_url, nullable: true
  api_association :avatar_urls, blueprint: AvatarUrlsSerializer, nullable: true
  api_field :group, type: :boolean
  api_field :channel_name
  api_field :organization_slug
  api_field :path
  api_field :call_room_url, nullable: true
  api_field :remote_call_room_id, nullable: true
  api_field :integration_dm?, name: :integration_dm, type: :boolean
  api_association :active_call, blueprint: MessageCallSerializer, nullable: true
  api_association :deactivated_members, is_array: true, blueprint: OrganizationMemberSerializer

  api_normalize "thread"

  api_field :title do |thread, opts|
    thread.formatted_title(opts[:member])
  end

  api_field :project_id, nullable: true do |thread|
    thread.project&.public_id
  end

  api_field :unread_count, type: :number do |thread, opts|
    preloads(opts, :thread_unread_counts, thread.id) || 0
  end

  api_field :manually_marked_unread, type: :boolean do |thread, opts|
    preloads(opts, :threads_marked_manually_unread, thread.id) || false
  end

  api_field :viewer_has_favorited, type: :boolean do |thread, options|
    !!preloads(options, :viewer_has_favorited, thread.id)
  end

  api_association :other_members, is_array: true, blueprint: OrganizationMemberSerializer do |thread, opts|
    thread.other_members(opts[:member])
  end

  api_field :viewer_is_thread_member, type: :boolean do |thread, opts|
    thread.viewer_is_thread_member?(opts[:member])
  end

  api_field :viewer_can_manage_integrations, type: :boolean do |thread, opts|
    thread.viewer_is_thread_member?(opts[:member]) && thread.group? && opts[:member].role_has_permission?(resource: Role::MESSAGE_THREAD_INTEGRATION_RESOURCE, permission: Role::CREATE_ACTION)
  end

  api_field :viewer_can_delete, type: :boolean do |thread, opts|
    thread.viewer_is_thread_member?(opts[:member]) && opts[:member].role_has_permission?(resource: Role::MESSAGE_THREAD_RESOURCE, permission: Role::DESTROY_ANY_ACTION)
  end

  api_field :viewer_can_force_notification, type: :boolean do |thread, opts|
    thread.viewer_can_force_notification?(opts[:member])
  end

  def self.preload(threads, options)
    member = options[:member]
    ids = threads.map(&:id)
    {
      thread_unread_counts: MessageThread.unread_counts_async(ids, member),
      threads_marked_manually_unread: MessageThread.manually_marked_unread_async(ids, member),
      viewer_has_favorited: MessageThread.viewer_has_favorited_async(ids, member),
    }
  end
end
