# frozen_string_literal: true

class CallSerializer < ApiSerializer
  api_field :public_id, name: :id
  api_field :title, nullable: true do |call, options|
    call.formatted_title(options[:member])
  end
  api_field :summary, name: :summary_html, nullable: true
  api_field :edited?, name: :is_edited, type: :boolean
  api_field :created_at
  api_field :started_at
  api_field :stopped_at, nullable: true
  api_field :formatted_duration, name: :duration, nullable: true
  api_field :formatted_recordings_duration, name: :recordings_duration, nullable: true
  api_field :active?, name: :active, type: :boolean
  api_field :project_permission, enum: Call.project_permissions.keys
  api_field :channel_name
  api_association :peers, blueprint: CallPeerSerializer, is_array: true
  api_association :project, blueprint: MiniProjectSerializer, nullable: true
  api_association :unshown_follow_ups, name: :follow_ups, blueprint: SubjectFollowUpSerializer, is_array: true

  api_normalize "call"

  api_field :viewer_can_edit, type: :boolean do |call, options|
    !!preloads(options, :viewer_can_edit, call.id)
  end

  api_field :viewer_can_destroy_all_recordings, type: :boolean do |call, options|
    !!preloads(options, :viewer_can_edit, call.id)
  end

  api_field :viewer_has_favorited, type: :boolean do |call, options|
    !!preloads(options, :viewer_has_favorited, call.id)
  end

  api_field :processing_generated_title?, name: :processing_generated_title, type: :boolean
  api_field :processing_generated_summary?, name: :processing_generated_summary, type: :boolean

  api_field :project_pin_id, nullable: true do |call, options|
    preloads(options, :project_pin_id, call.id)
  end

  api_field :url do |call, options|
    call.url(options[:organization])
  end

  def self.preload(calls, options)
    member = options[:member]
    ids = calls.pluck(:id)
    {
      viewer_can_edit: Call.viewer_can_edit_async(ids, member),
      viewer_has_favorited: Call.viewer_has_favorited_async(ids, member),
      project_pin_id: Call.pin_public_ids_async(ids, member),
    }
  end
end
