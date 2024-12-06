# frozen_string_literal: true

class NoteSerializer < ApiSerializer
  api_field :public_id, name: :id
  api_field :title, default: ""
  api_field :created_at
  api_field :last_activity_at
  api_field :content_updated_at
  api_field :comments_count, type: :number
  api_field :resolved_comments_count, type: :number
  api_field :channel_name
  api_field :presence_channel_name
  api_field :description_thumbnail_base_url, nullable: true
  api_field :public_visibility?, name: :public_visibility, type: :boolean
  api_field :non_member_views_count, type: :number

  api_field :description_html, default: ""
  api_field :description_state, nullable: true

  api_association :project, blueprint: ProjectSerializer, nullable: true
  api_association :unshown_follow_ups, name: :follow_ups, blueprint: FollowUpSerializer, is_array: true

  api_normalize "note"

  api_field :url do |note, options|
    note.url(options[:organization])
  end

  api_field :public_share_url do |note, options|
    note.public_share_url(options[:organization])
  end

  api_field :project_permission, enum: Note.project_permissions.keys

  api_association :member, blueprint: OrganizationMemberSerializer

  api_field :viewer_is_author, type: :boolean do |note, options|
    next false unless options[:member]

    note.organization_membership_id == options[:member].id
  end

  api_field :viewer_can_comment, type: :boolean do |note, options|
    note.viewer?(options[:user]) || note.project_viewer?(options[:user])
  end

  api_field :viewer_can_edit, type: :boolean do |note, options|
    note.editor?(options[:user]) || note.project_editor?(options[:user])
  end

  api_field :viewer_can_delete, type: :boolean do |note, options|
    note.member == options[:member] || options[:member]&.admin?
  end

  api_field :viewer_has_favorited, type: :boolean do |note, options|
    !!preloads(options, :viewer_has_favorited, note.id)
  end

  api_association :latest_commenters, is_array: true, blueprint: OrganizationMemberSerializer do |note, options|
    preloads(options, :preview_commenters, note.id) || []
  end

  api_association :permitted_users, is_array: true, blueprint: PermissionSerializer do |note, options|
    preloads(options, :permitted_users, note.id) || []
  end

  api_field :project_pin_id, nullable: true do |note, options|
    preloads(options, :project_pin_id, note.id)
  end

  api_association :resource_mentions, blueprint: ResourceMentionSerializer, is_array: true do |note, options|
    preloads(options, :resource_mentions, note.id)&.serializer_array || []
  end

  def self.preload(notes, options)
    member = options[:member]
    ids = notes.map(&:id)
    {
      preview_commenters: Note.preview_commenters_async(ids),
      permitted_users: Note.permitted_users_async(ids, member),
      viewer_has_favorited: Note.viewer_has_favorited_async(ids, member),
      project_pin_id: Note.pin_public_ids_async(ids, member),
      resource_mentions: Note.extracted_resource_mentions_async(subjects: notes, member: member),
    }
  end
end
