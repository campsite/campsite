# frozen_string_literal: true

class CommentSerializer < ApiSerializer
  def self.schema_name
    "Comment"
  end

  api_field :public_id, name: :id
  api_field :created_at
  api_field :timestamp, type: :number, nullable: true
  api_field :x, type: :number, nullable: true
  api_field :y, type: :number, nullable: true
  api_field :body_html, default: ""
  api_field :note_highlight, nullable: true
  api_field :resolved_at, nullable: true
  api_association :resolved_by, blueprint: OrganizationMemberSerializer, nullable: true

  api_normalize "comment"

  # both of these fields were deprecated on 6/10/24
  api_field :subject_type, type: :string
  api_field :subject_id do |comment|
    comment.subject.public_id
  end

  api_field :url do |comment, options|
    comment.url(options[:organization])
  end

  api_field :viewer_can_resolve, type: :boolean do |comment, options|
    next false unless options[:member]

    !comment.reply?
  end

  api_field :viewer_can_create_issue, type: :boolean do |_, options|
    next false unless options[:member]

    options[:member].role_has_permission?(resource: Role::ISSUE_RESOURCE, permission: Role::CREATE_ACTION)
  end

  api_field :attachment_id, nullable: true do |comment|
    comment.attachment&.public_id
  end

  api_field :canvas_preview_url, nullable: true do |comment|
    # don't show canvas preview for replies
    next nil if comment.reply?

    comment.canvas_preview_url
  end

  api_field :attachment_thumbnail_url, nullable: true do |comment|
    comment.attachment&.thumbnail_url
  end

  api_field :viewer_is_author, type: :boolean do |comment, options|
    next false unless options[:member]

    comment.organization_membership_id == options[:member]&.id
  end

  api_field :viewer_can_edit, type: :boolean do |comment, options|
    next false unless options[:member]

    if comment.organization_membership_id
      comment.organization_membership_id == options[:member].id
    elsif comment.oauth_application || comment.integration
      options[:member].role_has_permission?(resource: Role::COMMENT_RESOURCE, permission: Role::EDIT_INTEGRATION_CONTENT_ACTION)
    end
  end

  api_field :viewer_can_follow_up, type: :boolean do |_, options|
    !!options[:member]
  end

  api_field :viewer_can_react, type: :boolean do |_, options|
    !!options[:member]
  end

  api_field :viewer_can_delete, type: :boolean do |comment, options|
    next false unless options[:member]

    if options[:member].admin?
      true
    elsif comment.organization_membership_id
      comment.organization_membership_id == options[:member].id
    elsif comment.oauth_application || comment.integration
      options[:member].role_has_permission?(resource: Role::COMMENT_RESOURCE, permission: Role::DESTROY_INTEGRATION_CONTENT_ACTION)
    end
  end

  api_association :author, name: :member, blueprint: OrganizationMemberSerializer

  api_association :sorted_attachments, name: :attachments, blueprint: AttachmentSerializer, is_array: true

  api_association :grouped_reactions, is_array: true, blueprint: GroupedReactionSerializer do |comment, options|
    preloads(options, :grouped_reactions, comment.id) || []
  end

  api_association :replies, is_array: true, blueprint: CommentSerializer
  api_association :unshown_follow_ups, name: :follow_ups, blueprint: SubjectFollowUpSerializer, is_array: true

  api_field :parent_id, nullable: true do |comment|
    unless comment.parent_id.nil?
      comment&.parent&.public_id
    end
  end

  # only set by the client. server value is always false.
  api_field :is_optimistic, type: :boolean do
    false
  end

  api_field :optimistic_id, type: :string, nullable: true do
    nil
  end

  api_association :timeline_events, is_array: true, blueprint: TimelineEventSerializer

  api_association :resource_mentions, blueprint: ResourceMentionSerializer, is_array: true do |comment, options|
    preloads(options, :resource_mentions, comment.id)&.serializer_array || []
  end

  def self.preload(comments, options)
    member = options[:member]
    {
      grouped_reactions: Comment.grouped_reactions_async(comments.map(&:id), member),
      resource_mentions: Comment.extracted_resource_mentions_async(subjects: comments, member: member),
    }
  end
end
