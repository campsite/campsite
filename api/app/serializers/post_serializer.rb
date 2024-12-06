# frozen_string_literal: true

class PostSerializer < ApiSerializer
  api_field :public_id, name: :id
  api_field :title do |post|
    post.display_title || ""
  end
  api_field :title_from_description?, name: :is_title_from_description, type: :boolean
  api_field :created_at
  api_field :published_at, nullable: true
  api_field :published?, name: :published, type: :boolean
  api_field :last_activity_at
  api_field :comments_count, type: :number
  api_field :resolved_comments_count, type: :number
  api_field :version, type: :number
  api_field :path
  api_field :channel_name
  api_field :views_count, type: :number
  api_field :non_member_views_count, type: :number
  api_field :status, enum: Post.statuses.keys
  api_field :visibility, enum: Post.visibilities.keys
  api_field :open_graph_image_url, nullable: true
  api_field :thumbnail_url, nullable: true
  api_field :unfurled_link, nullable: true
  api_field :description_html, default: ""
  api_field :truncated_description_html, default: ""
  api_field :text_content_truncated?, name: :is_text_content_truncated, type: :boolean

  api_field :truncated_description_text, default: "" do |post, options|
    resource_mention_collection = preloads(options, :resource_mentions, post.id)
    post.plain_description_text_truncated_at(limit: 280, resource_mention_collection: resource_mention_collection)
  end

  api_field :url do |post, options|
    post.url(options[:organization])
  end

  api_normalize "post"

  api_association :organization, blueprint: PublicOrganizationSerializer
  api_association :sorted_attachments, name: :attachments, blueprint: AttachmentSerializer, is_array: true
  api_association :links, blueprint: PostLinkSerializer, is_array: true
  api_association :tags, blueprint: TagSerializer, is_array: true
  api_association :poll, blueprint: PollSerializer, nullable: true
  api_association :kept_feedback_requests, name: :feedback_requests, blueprint: PostFeedbackRequestSerializer, is_array: true, nullable: true
  api_association :unshown_follow_ups, name: :follow_ups, blueprint: SubjectFollowUpSerializer, is_array: true
  api_association :author, name: :member, blueprint: OrganizationMemberSerializer
  api_association :resolved_comment, blueprint: ResolvedCommentSerializer, nullable: true

  api_association :grouped_reactions, blueprint: GroupedReactionSerializer, is_array: true do |post, options|
    preloads(options, :grouped_reactions, post.id) || []
  end

  api_association :project, blueprint: MiniProjectSerializer

  api_field :has_parent, type: :boolean do |post|
    !post.root?
  end

  api_field :has_iterations, type: :boolean do |post|
    !post.leaf?
  end

  api_field :viewer_is_organization_member, type: :boolean do |_, options|
    !!options[:member]
  end

  api_field :viewer_is_author, type: :boolean do |post, options|
    next false unless options[:member]

    post.organization_membership_id == options[:member].id
  end

  api_field :viewer_has_commented, type: :boolean do |post, options|
    !!preloads(options, :viewer_has_commented, post.id)
  end

  api_association :preview_commenters, blueprint: CommentersSerializer do |post, options|
    commenters = preloads(options, :preview_commenters, post.id)

    { latest_commenters: commenters || [] }
  end

  api_field :viewer_feedback_status, enum: Post::VIEWER_FEEDBACK_STATUS do |post, options|
    preloads(options, :viewer_feedback_status, post.id) || :none
  end

  api_field :viewer_has_subscribed, type: :boolean do |post, options|
    !!preloads(options, :viewer_has_subscribed, post.id)
  end

  api_field :viewer_has_viewed, type: :boolean do |post, options|
    !!preloads(options, :viewer_has_viewed, post.id)
  end

  api_field :viewer_has_favorited, type: :boolean do |post, options|
    !!preloads(options, :viewer_has_favorited, post.id)
  end

  api_field :unseen_comments_count, type: :number do |post, options|
    preloads(options, :unseen_comment_counts, post.id, :count) || 0
  end

  api_field :viewer_can_resolve, type: :boolean do |_post, options|
    !!options[:member]&.role_has_permission?(resource: Role::POST_RESOURCE, permission: Role::RESOLVE_ANY_ACTION)
  end

  api_field :viewer_can_favorite, type: :boolean do |_post, options|
    !!options[:member]
  end

  api_field :viewer_can_edit, type: :boolean do |post, options|
    if post.member
      post.member.id == options[:member]&.id
    elsif post.oauth_application || post.integration
      !!options[:member]&.role_has_permission?(resource: Role::POST_RESOURCE, permission: Role::EDIT_INTEGRATION_CONTENT_ACTION)
    else
      false
    end
  end

  api_field :viewer_can_delete, type: :boolean do |post, options|
    next false unless options[:member]

    if options[:member].admin?
      true
    elsif post.member
      post.member.id == options[:member].id
    elsif post.oauth_application || post.integration
      !!options[:member].role_has_permission?(resource: Role::POST_RESOURCE, permission: Role::DESTROY_INTEGRATION_CONTENT_ACTION)
    else
      false
    end
  end

  api_field :viewer_can_create_issue, type: :boolean do |_, options|
    next false unless options[:member]

    options[:member].role_has_permission?(resource: Role::ISSUE_RESOURCE, permission: Role::CREATE_ACTION)
  end

  api_association :resolution, blueprint: PostResolutionSerializer, nullable: true do |post|
    next unless post.resolved?

    {
      resolved_at: post.resolved_at,
      resolved_by: post.resolved_by,
      resolved_html: post.resolved_html,
      resolved_comment: post.resolved_comment,
    }
  end

  api_field :latest_comment_preview, nullable: true do |post, options|
    preloads(options, :latest_comments, post.id)&.post_preview_text
  end

  api_field :latest_comment_path, nullable: true do |post, options|
    preloads(options, :latest_comments, post.id)&.path
  end

  api_field :viewer_is_latest_comment_author, type: :boolean do |post, options|
    next false unless options[:member]

    latest_comment = preloads(options, :latest_comments, post.id)
    next false unless latest_comment

    latest_comment.organization_membership_id == options[:member].id
  end

  api_field :project_pin_id, nullable: true do |post, options|
    preloads(options, :project_pin_id, post.id)
  end

  api_association :resource_mentions, blueprint: ResourceMentionSerializer, is_array: true do |post, options|
    preloads(options, :resource_mentions, post.id)&.serializer_array || []
  end

  def self.preload(posts, options)
    member = options[:member]
    post_ids = posts.map(&:id)
    {
      grouped_reactions: Post.grouped_reactions_async(post_ids, member),
      preview_commenters: Post.preview_commenters_async(post_ids),
      viewer_has_commented: Post.viewer_has_commented_async(post_ids, member),
      viewer_has_subscribed: Post.viewer_has_subscribed_async(post_ids, member),
      viewer_has_viewed: Post.viewer_has_viewed_async(post_ids, member),
      viewer_has_favorited: Post.viewer_has_favorited_async(post_ids, member),
      viewer_voted_option_ids_by_poll_id: Post.viewer_voted_option_ids_by_poll_id_async(post_ids, member),
      unseen_comment_counts: Post.unseen_comment_counts_async(post_ids, member),
      viewer_feedback_status: Post.viewer_feedback_status_async(posts, member),
      latest_comments: Post.latest_comment_async(posts, member),
      project_pin_id: Post.pin_public_ids_async(post_ids, member),
      resource_mentions: Post.extracted_resource_mentions_async(subjects: posts, member: member),
    }
  end
end
