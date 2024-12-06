# frozen_string_literal: true

class MessageThreadPusherSerializer < ApiSerializer
  api_field :public_id, name: :id
  api_field :last_message_at, nullable: true
  api_field :latest_message_truncated, nullable: true do |thread, opts|
    thread.latest_message_truncated(viewer: opts[:member])
  end
  api_field :organization_slug
  api_field :path
  api_field :call_room_url, nullable: true
  api_field :remote_call_room_id, nullable: true
  api_association :active_call, blueprint: MessageCallSerializer, nullable: true

  api_field :viewer_can_force_notification, type: :boolean do |thread, opts|
    thread.viewer_can_force_notification?(opts[:member])
  end

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

  def self.preload(threads, options)
    member = options[:member]
    ids = threads.map(&:id)
    {
      thread_unread_counts: MessageThread.unread_counts_async(ids, member),
    }
  end
end
