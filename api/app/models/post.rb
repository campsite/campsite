# frozen_string_literal: true

class Post < ApplicationRecord
  POST_FILE_LIMIT = 10 # This can be removed once we have migrated to attachments
  FILE_LIMIT = 10 # This is for attachments
  POST_TAG_LIMIT = 10
  DIGEST_LIMIT = 16
  PUBLIC_API_ALLOWED_ORDER_FIELDS = [:last_activity_at, :published_at]

  include Discard::Model
  include PublicIdGenerator
  include Mentionable
  include Eventable
  include Reactable
  include ActionView::Helpers::UrlHelper
  include ActionView::Helpers::SanitizeHelper
  include TaskUpdatable
  include ImgixUrlBuilder
  include SearchConfigBuilder
  include Commentable
  include FollowUpable
  include Favoritable
  include Pinnable
  include Referenceable
  include AttachmentsReorderable
  include WorkflowActiverecord
  include ResourceMentionable

  belongs_to :member, class_name: "OrganizationMembership", foreign_key: :organization_membership_id, optional: true
  belongs_to :integration, optional: true
  belongs_to :oauth_application, optional: true
  belongs_to :organization
  belongs_to :project
  belongs_to :parent, class_name: "Post", optional: true, foreign_key: :post_parent_id
  belongs_to :resolved_by, polymorphic: true, optional: true
  belongs_to :resolved_comment, class_name: "Comment", optional: true

  # The resolved_comment's subject will always be this post.
  # Formalize that relationship to avoid an n+1.
  def resolved_comment
    super&.tap { |comment| comment.subject = self }
  end

  counter_culture :project, column_name: :posts_count

  has_one :poll, dependent: :destroy_async

  belongs_to :from_message, class_name: "Message", optional: true
  has_many :system_share_messages, class_name: "Message", foreign_key: :system_shared_post_id

  has_many :attachments, as: :subject, dependent: :destroy
  has_many :links, class_name: "PostLink", dependent: :destroy_async
  has_many :post_taggings, dependent: :destroy_async
  has_many :tags, through: :post_taggings, source: :tag
  has_many :slack_links, -> { where(name: PostLink::SLACK) }, class_name: "PostLink", dependent: :destroy_async
  has_many :subscriptions, class_name: "UserSubscription", as: :subscribable
  has_many :subscribers, through: :subscriptions, source: :user
  has_many :views, class_name: "PostView", dependent: :destroy_async
  has_many :non_member_views, class_name: "NonMemberPostView", dependent: :destroy_async
  has_many :viewers, through: :views, source: :member
  has_many :kept_feedback_requests, -> { kept_and_not_dismissed.order(created_at: :asc) }, class_name: "PostFeedbackRequest"
  has_many :feedback_requests, class_name: "PostFeedbackRequest", dependent: :destroy_async
  has_many :llm_responses, as: :subject
  has_many :timeline_events, as: :subject, dependent: :destroy_async

  before_create :set_root_id
  before_create :set_version
  before_create :set_last_activity_at

  after_create :update_project_contributors_count
  after_destroy :update_project_contributors_count
  after_discard :remove_from_version_tree
  after_save :cascade_project_update, if: -> { saved_change_to_project_id? }
  after_save :update_project_contributors_count, if: -> { saved_change_to_project_id? }
  after_save :broadcast_content_stale, if: -> { live_update_attributes.any? { |attribute| saved_change_to_attribute?(attribute) } }
  after_create_commit :subscribe_user
  after_commit :dup_parent_subscribers, only: [:create, :update]
  after_destroy_commit :enqueue_delete_slack_message_job
  after_discard :enqueue_delete_slack_message_job
  after_save :set_parent_stale

  delegate :slack_token, :members_base_url, to: :organization
  delegate :user, to: :member, allow_nil: true
  delegate :mrkdwn_link, to: SlackBlockKit

  scope :desc_order, -> { order(created_at: :desc) }

  FEED_INCLUDES = [
    :links,
    :project,
    :tags,
    :integration,
    :oauth_application,
    organization: :admins,
    poll: :options,
    attachments: :figma_file,
    member: OrganizationMembership::SERIALIZER_EAGER_LOAD,
    kept_feedback_requests: { member: OrganizationMembership::SERIALIZER_EAGER_LOAD },
    unshown_follow_ups: { organization_membership: OrganizationMembership::SERIALIZER_EAGER_LOAD },
    resolved_comment: [
      :integration,
      :oauth_application,
      { member: OrganizationMembership::SERIALIZER_EAGER_LOAD },
    ],
  ].freeze
  scope :feed_includes, -> {
    eager_load(*FEED_INCLUDES).preload(resolved_by: OrganizationMembership::SERIALIZER_EAGER_LOAD)
  }
  scope :public_api_includes, -> {
    eager_load(:project, :integration, :oauth_application, member: [:user]).preload(resolved_by: OrganizationMembership::SERIALIZER_EAGER_LOAD)
  }
  scope :search_title, ->(query_string) do
    eager_load(member: OrganizationMembership::SERIALIZER_EAGER_LOAD)
      .where("posts.title LIKE ?", "%#{query_string}%")
      .or(where("users.name LIKE ?", "%#{query_string.titleize}%"))
      .or(where("users.username LIKE ?", "%#{query_string.titleize}%"))
  end

  scope :not_private,
    -> {
      left_outer_joins(:project)
        .where(project_id: nil).or(where(project: { private: false }))
    }
  scope :with_project_membership_for,
    ->(user) {
      where(
        <<~SQL.squish, user.id
          EXISTS (
            SELECT 1 FROM project_memberships
            JOIN organization_memberships
              ON organization_memberships.id = project_memberships.organization_membership_id
            WHERE project_memberships.project_id = posts.project_id
              AND project_memberships.discarded_at IS NULL
              AND organization_memberships.user_id = ?
              AND organization_memberships.discarded_at IS NULL
          )
        SQL
      )
    }
  scope :with_subscription_for,
    ->(user) {
      where(
        <<~SQL.squish, user.id
          EXISTS (
            SELECT 1 FROM user_subscriptions
            WHERE user_subscriptions.subscribable_type = 'Post'
              AND user_subscriptions.subscribable_id = posts.id
              AND user_subscriptions.user_id = ?
          )
        SQL
      )
    }
  scope :viewable_by,
    ->(user) {
      merge(
        not_private.merge(Project.with_view_all_permission_for(user, projects_table_alias: :project))
        .or(with_project_membership_for(user)),
      )
        .merge(
          left_outer_joins(:member).with_published_state
          .or(left_outer_joins(:member).where({ member: { user_id: user.id } })),
        )
    }
  scope :viewable_by_api_actor, ->(api_actor) {
    joins(:project).merge(Project.viewable_by_api_actor(api_actor))
  }

  scope :leaves, -> { where(stale: false) }
  scope :with_active_project, -> { left_outer_joins(:project).where(project: { archived_at: nil }) }

  scope :requested_feedback_in_the_last_week, -> {
    feedback_requested_status
      .where(created_at: 1.week.ago..)
  }
  scope :eager_load_llm_content, -> {
    eager_load(kept_comments: [member: :user, kept_replies: { member: :user }])
  }
  scope :unread, -> do
    # This purposefully ignores read_at as users may mark a post "viewed" without actually reading it.
    # read_at influences the "viewers" facepile.
    # This scope assumes there is a JOIN on organization_memberships in the query
    where(
      <<~SQL.squish,
        NOT EXISTS (
          SELECT 1
          FROM post_views
          WHERE
            post_views.post_id = posts.id
            AND post_views.organization_membership_id = organization_memberships.id
        )
      SQL
    )
  end
  scope :unresolved, -> { where(resolved_at: nil) }

  enum :status, { none: 0, feedback_requested: 1 }, suffix: true
  enum :visibility, { default: 0, public: 1 }, suffix: true

  workflow do
    state :draft do
      event :publish, transitions_to: :published
    end

    state :published do
      on_entry do
        instrument_published_event
        update(published_at: Time.current, last_activity_at: Time.current)
      end
    end
  end

  searchkick \
    callbacks: Rails.env.test? ? :inline : :async,
    text_start: [:title, :description, :comments_content, :user_name, :user_username, :project_name],
    word_start: [:title, :description, :comments_content, :user_name, :user_username, :project_name],
    highlight: [:title, :description, :comments_content],
    filterable: [:organization_id, :project_id, :tag_ids, :user_id, :discarded_at],
    merge_mappings: true,
    mappings: {
      properties: {
        # created_at is used in the boost_by_recency option, thus in a function_score
        # it must be mapped otherwise searches will crash on empty indices
        created_at: { type: "date" },
      },
    }

  def search_data
    {
      id: id,
      public_id: public_id,
      title: display_title,
      description: plain_description_text,
      comments_content: searchable_comment_content,
      created_at: created_at,
      organization_id: organization_id,
      project_id: project_id,
      project_name: project&.name,
      user_id: user&.id,
      user_username: user&.username,
      user_name: user&.name,
      discarded_at: discarded_at,
      tag_ids: tags.pluck(:id),
    }
  end

  scope :search_import, -> { includes(:project, :tags, member: OrganizationMembership::SERIALIZER_EAGER_LOAD).preload(:kept_comments) }

  def self.scoped_search(
    query:,
    organization:,
    limit: 250,
    author_username: nil,
    user_id: nil,
    project_public_id: nil,
    tag_name: nil,
    sort_by_date: false,
    per_page: nil,
    page: nil
  )
    where = {
      organization_id: organization.id,
      discarded_at: nil,
    }

    where[:project_id] = organization.projects.find_by!(public_id: project_public_id).id if project_public_id.present?
    where[:user_id] = user_id if user_id
    where[:tag_ids] = organization.tags.find_by!(name: tag_name).id if tag_name.present?

    if author_username.present?
      where[:user_id] = organization.memberships.includes(:user).find_by!(user: { username: author_username }).user_id
    elsif user_id
      where[:user_id] = user_id
    end

    fields = [
      # exact-match phrases get the highest boost
      { title: :phrase, boost: 3 },
      { description: :phrase, boost: 3 },
      { comments_content: :phrase, boost: 3 },
      { user_name: :phrase, boost: 3 },
      { user_username: :phrase, boost: 3 },
      { project_name: :phrase, boost: 3 },

      # boost phrase partial matches
      { title: :text_start, boost: 2 },
      { description: :text_start, boost: 2 },
      { comments_content: :text_start, boost: 2 },
      { user_name: :text_start, boost: 2 },
      { user_username: :text_start, boost: 2 },
      { project_name: :text_start, boost: 2 },

      # least restrictive: match any word in the query
      { title: :word_start },
      { description: :word_start },
      { comments_content: :word_start },
      { user_name: :word_start },
      { user_username: :word_start },
    ]

    search(
      query,
      fields: fields,
      operator: "or",
      boost_by_recency: { created_at: { scale: "7d", offset: "2d", decay: 0.999 } },
      misspellings: { below: 2 },
      where: where,
      page: page || 1,
      per_page: per_page || limit,
      order: sort_by_date ? { created_at: :desc } : nil,
      load: false,
      debug: false,
      body_options: {
        highlight: search_highlight_config(query, [:title, :description, :comments_content]),
      },
      boost_where: {
        title: { factor: 2, should_match: 2 },
      },
    )
  end

  def self.scoped_title_search(
    query:,
    organization:,
    limit: 250
  )
    where = {
      organization_id: organization.id,
      discarded_at: nil,
    }

    fields = [
      { title: :phrase, boost: 3 },
      { title: :text_start, boost: 2 },
      { title: :word_start },
    ]

    search(
      query,
      fields: fields,
      operator: "or",
      boost_by_recency: { created_at: { scale: "7d", offset: "2d", decay: 0.999 } },
      misspellings: { below: 2 },
      where: where,
      per_page: limit,
      load: false,
      debug: false,
    )
  end

  def self.create_post(params:, parent:, project:, member:, organization:, skip_notifications: false)
    Post::CreatePost.new(
      params: params,
      parent: parent,
      project: project,
      organization: organization,
      member: member,
      skip_notifications: skip_notifications,
    ).run
  end

  def update_post(actor:, organization:, project:, params:)
    @event_actor = actor

    Post::UpdatePost.new(
      post: self,
      actor: actor,
      organization: organization,
      project: project,
      params: params,
    ).run

    @event_actor = nil
  end

  def post
    self
  end

  def api_type_name
    "Post"
  end

  def slack_channel_ids
    ids = if project&.slack_channel_id
      [project.slack_channel_id]
    else
      []
    end
    ids.uniq
  end

  def slackable?
    slack_token.present? && slack_channel_ids.present?
  end

  def private?
    return false unless project_id

    project.private?
  end

  def channel_name
    "post-#{public_id}"
  end

  def author
    post.integration || post.oauth_application || post.member || OrganizationMembership::NullOrganizationMembership.new(system: true)
  end

  # provide a known org to prevent N+1s
  def path(organization = nil)
    (organization || self.organization).path + "/posts/#{public_id}"
  end

  # provide a known org to prevent N+1s
  def url(organization = nil)
    Campsite.app_url(path: path(organization))
  end

  def plain_description_text(strip_quotes: false, resource_mention_collection: nil)
    HtmlTransform.new(description_html, {
      strip_quotes: strip_quotes,
      resource_mention_map: resource_mention_collection&.href_title_map,
    }).plain_text
  end

  def plain_description_text_truncated_at(strip_quotes: false, limit:, resource_mention_collection: nil)
    lines = plain_description_text(
      strip_quotes: strip_quotes,
      resource_mention_collection: resource_mention_collection,
    )&.lines

    return if lines.blank?

    first = lines.first
    truncated = first.truncate(limit, separator: /\s/)
    is_multiline = lines.size > 1

    if truncated != first
      # truncated so just return that
      truncated
    elsif is_multiline
      # under the truncation mark but there is more text. add ellipsis to hint there's more.
      "#{first.strip}..."
    else
      # just return the first line
      first
    end
  end

  def mailer_description_html
    @mailer_description_html ||= RichText.new(description_html)
      .replace_mentions_with_links(members_base_url: members_base_url)
      .replace_resource_mentions_with_links(organization)
      .replace_link_unfurls_with_links
      .to_s
  end

  def mailer_truncated_description_html
    @mailer_truncated_description_html ||= HtmlTruncator.new(mailer_description_html).truncate_after_css("p").to_html
  end

  def slack_description_html
    @slack_description_html ||= RichText.new(description_html)
      .replace_mentions_with_links(members_base_url: members_base_url)
      .replace_resource_mentions_with_links(organization)
      .replace_link_unfurls_with_links
      .to_s
  end

  def truncated_description_html
    return unless description_html

    truncated_description.to_html
  end

  def text_content_truncated?
    truncated_description.is_text_content_truncated
  end

  def truncated_description_text(resource_mention_collection: nil)
    plain_description_text_truncated_at(limit: 280, resource_mention_collection: resource_mention_collection)
  end

  def fallback_description_text
    if attachments.any?
      "#{attachments.length} #{"attachment".pluralize(attachments.length)}"
    elsif unfurled_link
      "Shared a link"
    elsif poll
      "Created a poll"
    end
  end

  def mentionable_attribute
    :description_html
  end

  def update_task(index:, checked:)
    update_column(:description_html, update_checked_task(content: description_html, index: index, checked: checked))
  end

  def slack_client
    @slack_client ||= Slack::Web::Client.new(token: slack_token)
  end

  def delete_slack_message!
    slack_client.chat_delete({ channel: slack_channel_id, ts: slack_message_ts })
  end

  def build_slack_blocks
    BuildSlackBlocks.new(post: self).run
  end

  def build_slack_message
    {
      text: "#{author.display_name} shared work in progress",
      blocks: build_slack_blocks,
      link_names: true,
      unfurl_links: unfurl_description_links_in_slack?,
    }
  end

  def debug_block_url
    blocks = { blocks: build_slack_blocks }.to_json
    escaped_blocks = URI::DEFAULT_PARSER.escape(blocks, Regexp.new("[^#{URI::PATTERN::UNRESERVED}]"))
    # campsite slack team id
    "https://app.slack.com/block-kit-builder/T03CG56S76J##{escaped_blocks}"
  end

  def note_open_graph_image_url
    return unless description_html

    path = "/v1/post_note_open_graph_images/#{public_id}/#{contents_hash}"

    if Rails.env.production? || ENV["CAMPSITE_NGROK"] == "true"
      build_imgix_folder_url(path)
    else
      "http://api.campsite.test:3001#{path}"
    end
  end

  def contents_hash
    # hash the contents so that we can MISS imgix cache when the contents change
    # change the version to force a cache MISS
    version = "4"
    Digest::MD5.hexdigest(title.to_s + description_html + version)
  end

  def mailer_hero_attachments
    sorted_attachments&.select(&:mailer_hero?)
  end

  def origami_attachments
    sorted_attachments&.select(&:origami?)
  end

  def principle_attachments
    sorted_attachments&.select(&:principle?)
  end

  def stitch_attachments
    sorted_attachments&.select(&:stitch?)
  end

  def lottie_attachments
    sorted_attachments&.select(&:lottie?)
  end

  def create_slack_message!(slack_id)
    message = build_slack_message

    message[:channel] = slack_id
    message_result = slack_client.chat_postMessage(message)
    permalink_result = slack_client.chat_getPermalink({ channel: slack_id, message_ts: message_result["ts"] })
    links.create(name: PostLink::SLACK, url: permalink_result["permalink"])
  rescue Slack::Web::Api::Errors::NotInChannel
    # join the slack channel
    slack_client.conversations_join(channel: slack_id)

    create_slack_message!(slack_id)
  end

  def subscribed?(user)
    user && subscribers.include?(user)
  end

  def event_actor
    @event_actor || member || oauth_application || integration
  end

  def event_organization
    organization
  end

  def notification_summary(notification:)
    reason = notification.reason
    actor = notification.actor
    organization = notification.organization
    url = self.url(organization)
    post_title = notification_title_plain(notification)

    case reason
    when "mention"
      return NotificationSummary.new(
        text: "#{actor.display_name} mentioned you in #{post_title}",
        blocks: [
          {
            text: { content: actor.display_name, bold: true },
          },
          {
            text: { content: " mentioned you on " },
          },
          notification_title_block(notification),
        ],
        slack_mrkdwn: "#{actor.display_name} #{mrkdwn_link(url: url, text: "mentioned you in #{post_title}")}",
        email: link_to(content_tag(:b, actor.display_name), "#{organization.url}/people/#{actor.username}", target: "_blank", rel: "noopener") + " mentioned you in a post",
      )
    when "parent_subscription"
      return NotificationSummary.new(
        text: "#{actor.display_name} iterated on #{post_title}",
        blocks: [
          {
            text: { content: actor.display_name, bold: true },
          },
          {
            text: { content: " iterated on " },
          },
          notification_title_block(notification),
        ],
        slack_mrkdwn: "#{actor.display_name} #{mrkdwn_link(url: url, text: "iterated on #{post_title}")}",
        email: link_to(content_tag(:b, actor.display_name), "#{organization.url}/people/#{actor.username}", target: "_blank", rel: "noopener") + " iterated on a post you follow",
      )
    when "project_subscription"
      return NotificationSummary.new(
        text: "#{actor.display_name} posted in #{project.name}",
        blocks: [
          {
            text: { content: actor.display_name, bold: true },
          },
          {
            text: { content: " posted in " },
          },
          {
            text: { content: project.name, bold: true },
          },
        ],
        slack_mrkdwn: "#{actor.display_name} #{mrkdwn_link(url: url, text: "posted")} in #{mrkdwn_link(url: project.url(organization), text: project.name)}",
        email: link_to(content_tag(:b, actor.display_name), "#{organization.url}/people/#{actor.username}", target: "_blank", rel: "noopener") + " posted in " + content_tag(:b, project.name),
      )
    when "post_resolved"
      return NotificationSummary.new(
        text: "#{actor.display_name} resolved #{post_title}",
        blocks: [
          {
            text: { content: actor.display_name, bold: true },
          },
          {
            text: { content: " resolved " },
          },
          notification_title_block(notification),
        ],
        slack_mrkdwn: "#{actor.display_name} #{mrkdwn_link(url: url, text: "resolved #{post_title}")}",
        email: link_to(content_tag(:b, actor.display_name), "#{organization.url}/people/#{actor.username}", target: "_blank", rel: "noopener") + " resolved a post you follow",
      )
    when "post_resolved_from_comment"
      return NotificationSummary.new(
        text: "#{actor.display_name} resolved #{post_title} with your comment",
        blocks: [
          {
            text: { content: actor.display_name, bold: true },
          },
          {
            text: { content: " resolved " },
          },
          notification_title_block(notification),
          {
            text: { content: " with your comment" },
          },
        ],
        slack_mrkdwn: "#{actor.display_name} #{mrkdwn_link(url: url, text: "resolved")} #{mrkdwn_link(url: url, text: post_title)} with your comment",
        email: link_to(content_tag(:b, actor.display_name), "#{organization.url}/people/#{actor.username}", target: "_blank", rel: "noopener") + " resolved a post with your comment",
      )
    end

    raise "Couldn't create summary for Post #{id} (reason #{reason})"
  end

  def notification_body_preview(notification:)
    case notification.reason
    when "post_resolved"
      truncated = HtmlTransform.new(resolved_html, {
        strip_quotes: true,
      }).plain_text
        .split("\n")
        .first
        &.truncate(140, separator: /\s/)
      if truncated.present?
        truncated
      elsif resolved_comment
        "#{resolved_comment.member.user.display_name}'s comment"
      end
    when "post_resolved_from_comment"
      # show a preview via reply_to
      nil
    when "project_subscription"
      trimmed_body_preview.presence
    else
      # when the notification is about this post, show a body preview
      # otherwise the body preview is redundant
      if notification.subject == self
        trimmed_body_preview.presence
      end
    end
  end

  def notification_reply_to_body_preview(notification:)
    case notification.reason
    when "post_resolved_from_comment"
      resolved_comment.plain_body_text_truncated_at(strip_quotes: true, limit: 140)
    end
  end

  def follow_up_body_preview
    title_from_description.presence || trimmed_body_preview.presence
  end

  def follow_up_summary_blocks(follow_up_member:)
    is_self_follow_up = author == follow_up_member
    relative_post_author = is_self_follow_up ? "Your" : "#{author.display_name}'s"
    post_project = project&.name || "a space"
    [
      {
        text: { content: relative_post_author, bold: !is_self_follow_up },
      },
      {
        text: { content: " post in " },
      },
      {
        text: { content: post_project, bold: true },
      },
    ]
  end

  def trimmed_body_preview
    plain_description_text_truncated_at(limit: 280)
  end

  def notification_title_plain(notification)
    if (title = display_title)
      title
    elsif member == notification.organization_membership
      "your post"
    elsif member == notification.actor
      "their post"
    else
      "#{author.display_name}'s post"
    end
  end

  def slack_link_title
    display_title || "#{author.display_name}'s post"
  end

  def notification_title_block(notification)
    if (title = display_title)
      {
        text: { content: title, bold: true },
      }
    elsif member == notification.organization_membership
      {
        text: { content: "your post" },
      }
    elsif member == notification.actor
      {
        text: { content: "their post" },
      }
    else
      {
        text: { content: "#{author.display_name}'s post" },
      }
    end
  end

  def notification_target_title
    display_title || "#{author.display_name}’s post"
  end

  def thumbnail_url
    sorted_attachments.first&.thumbnail_url
  end

  def notification_preview_url(notification:)
    thumbnail_url
  end

  def notification_preview_is_canvas(notification:)
    false
  end

  def display_title
    (title.presence || title_from_description.presence)&.strip
  end

  def title_from_description?
    title.blank? && title_from_description.present?
  end

  def title_from_description
    @title_from_descrition ||= begin
      first_child = parsed_description_html.children.first
      return unless first_child

      # return the text if the first child is a header tag
      if first_child.name.in?(["h1", "h2", "h3", "h4", "h5", "h6"])
        return first_child.text
      end

      # if the first child is a paragraph and has a strong or bold tag, return the text
      if first_child.name == "p" && first_child.children.count == 1 && first_child.children[0].name.in?(["strong", "b"])
        first_child.text
      end
    end
  end

  def seo_title
    display_title || "Post by #{author.display_name}"
  end

  def seo_description
    "#{organization.name} · #{author.display_name}"
  end

  def open_graph_image_url
    sorted_attachments.first&.open_graph_image_url || note_open_graph_image_url
  end

  def open_graph_video_url
    return unless sorted_attachments.first&.video?

    sorted_attachments.first&.url
  end

  def notification_body_slack_blocks
    block_builder = BuildSlackBlocks.new(post: self)

    [
      *block_builder.description_blocks,
      *block_builder.preview_blocks,
      *block_builder.attachment_context_blocks,
      block_builder.project_block,
      block_builder.tags_block,
    ].compact
  end

  attr_writer :event_actor

  def discard_by_actor(actor)
    @event_actor = actor
    discard
    comments.discard_all_by_actor(actor)
    reactions.discard_all_by_actor(actor)
    feedback_requests.discard_all_by_actor(actor)
    system_share_messages.discard_all_by_actor(actor)
    if from_message_id
      InvalidateMessageJob.perform_async(actor&.id, from_message_id, "update-message")
    end
    @event_actor = nil
  end

  def self.viewer_has_commented_async(post_ids, membership)
    unless membership
      return AsyncPreloader.value(post_ids.index_with { |_post_id| false })
    end

    scope = Comment.where(subject_id: post_ids, subject_type: Post)
      .kept
      .where(member: membership)
      .group(:subject_id)
      .async_count

    AsyncPreloader.new(scope) do |scope|
      scope.transform_values { |count| count > 0 }
    end
  end

  def self.viewer_voted_option_ids_by_poll_id_async(post_ids, membership)
    return AsyncPreloader.value({}) unless membership

    scope = PollVote
      .joins(poll_option: :poll)
      .where(polls: { post_id: post_ids }, organization_membership_id: membership.id)
      .group("polls.id")
      .async_pluck("polls.id", Arel.sql("GROUP_CONCAT(poll_options.id)"))
    AsyncPreloader.new(scope) do |scope|
      scope.to_h.transform_values { |option_ids| option_ids.split(",").map(&:to_i) }
    end
  end

  def self.viewer_has_subscribed_async(post_ids, membership)
    return AsyncPreloader.value({}) unless membership

    scope = UserSubscription
      .where(subscribable_type: Post.to_s, subscribable_id: post_ids, user_id: membership.user_id)
      .group(:subscribable_id)
      .async_count

    AsyncPreloader.new(scope) do |scope|
      scope.transform_values { |count| count > 0 }
    end
  end

  def self.unseen_comment_counts_async(post_ids, membership)
    return AsyncPreloader.value({}) unless membership

    select_gt_updated_at = <<~SQL.squish
      #{Comment.table_name}.created_at > post_views.updated_at
    SQL
    select_distinct_comment_ids = <<~SQL.squish
      COUNT(DISTINCT CASE WHEN #{select_gt_updated_at} THEN #{Comment.table_name}.id END)
    SQL
    select_max_comment_created_at = <<~SQL.squish
      MAX(DISTINCT CASE WHEN #{select_gt_updated_at} THEN #{Comment.table_name}.created_at END)
    SQL

    scope = Comment
      .select(
        "#{Comment.table_name}.subject_id",
        "#{select_distinct_comment_ids} AS unseen_count",
        "#{select_max_comment_created_at} AS latest_at",
      )
      .kept
      .where(subject_id: post_ids, subject_type: Post)
      .where.not(member: membership)
      .joins("LEFT JOIN post_views ON post_views.post_id = #{Comment.table_name}.subject_id AND post_views.organization_membership_id = #{membership.id}")
      .group(:subject_id)
      .load_async

    AsyncPreloader.new(scope) do |scope|
      scope.map { |r| [r.subject_id, { count: r.unseen_count, latest_at: r.latest_at }] }.to_h
    end
  end

  VIEWER_FEEDBACK_STATUS = [
    :none,
    :viewer_requested,
    :open,
  ].freeze

  def self.viewer_feedback_status_async(posts, membership)
    return AsyncPreloader.value({}) unless membership

    # set true for all posts that need feedback requests fetched
    # this way we skip fetching feedback for posts we know don't need viewer feedback
    result = posts.each_with_object({}) { |post, map| map[post.id] = post.status == "feedback_requested" && membership.id != post.organization_membership_id ? :open : :none }

    # get post ids that have feedback requests
    has_requested_ids = result.select { |_, value| value == :open }.keys

    if has_requested_ids.empty?
      result
    else
      # get all active feedback requests for the viewer
      scope = PostFeedbackRequest
        .select(:post_id, :dismissed_at, :has_replied)
        .where(post_id: has_requested_ids, discarded_at: nil, member: membership)
        .group(:post_id, :dismissed_at, :has_replied)
        .load_async

      AsyncPreloader.new(scope) do |scope|
        scope.each do |r|
          result[r.post_id] = r.dismissed_at.nil? && !r.has_replied ? :viewer_requested : :none
        end

        result
      end
    end
  end

  def self.viewer_has_viewed_async(post_ids, membership)
    unless membership
      return AsyncPreloader.value(post_ids.index_with { |_post_id| false })
    end

    scope = PostView
      .where(post_id: post_ids, member: membership)
      .group(:post_id)
      .async_count

    AsyncPreloader.new(scope) do |scope|
      scope.transform_values { |count| count > 0 }
    end
  end

  def self.latest_comment_async(posts, membership)
    return AsyncPreloader.value({}) unless membership

    subquery = Comment
      .kept
      .select("max(comments.id)")
      .where(subject: posts)
      .group(:subject_id)

    scope = Comment.where(id: subquery)
      .serializer_preloads
      .load_async

    AsyncPreloader.new(scope) do |scope|
      posts_by_id = posts.index_by(&:id)

      scope.index_by(&:subject_id).map do |post_id, comment|
        comment.subject = posts_by_id[post_id]
        [post_id, comment]
      end.to_h
    end
  end

  def resource_mentionable_parsed_html
    parsed_description_html
  end

  # attachments are fetched eagerly where order may not be preserved
  def sorted_attachments
    attachments.sort_by(&:position)
  end

  def ancestors
    versions.where("version < ?", version).kept
  end

  def descendants
    versions.where("version > ?", version).kept
  end

  def self_and_descendants
    versions.where("version >= ?", version).kept
  end

  def leaf?
    !stale
  end

  def root?
    root_id.nil?
  end

  def root
    return self if root?

    Post.find(root_id)
  end

  def unfurl_description_links_in_slack?
    attachments.none? && !!unfurled_link && parsed_description_html.css("a").one?
  end

  def update_last_activity_at_column
    update_columns(last_activity_at: [most_recent_kept_comment&.created_at, published_at, created_at].compact.max)
  end

  def resolve!(actor:, html:, comment_id:)
    @event_actor = actor
    update!(
      resolved_at: Time.current,
      resolved_by: actor,
      resolved_html: html,
      resolved_comment: comment_id.present? ? comments.find_by!(public_id: comment_id) : nil,
    )
    @event_actor = nil

    broadcast_invalidate
  end

  def unresolve!(actor:)
    @event_actor = actor
    update!(resolved_at: nil, resolved_by: nil, resolved_html: nil, resolved_comment: nil)
    @event_actor = nil

    broadcast_invalidate
  end

  def resolved?
    resolved_at.present?
  end

  def favoritable_name(member = nil)
    post.title.presence || post.title_from_description.presence || truncated_description_text
  end

  def broadcast_invalidate
    PusherTriggerJob.perform_async(post.channel_name, "invalidate-post", { post_id: public_id }.to_json)
  end

  def generate_resolution_prompt(comment = nil)
    system = if comment
      <<~PROMPT.squish
        Provide a concise summary of the final conversation outcome, highlighting responsible parties for actions or decisions.
        Focus solely on the conversation's conclusion, omitting intermediate steps.
        Utilize language akin to the original discourse but maintain a professional tone.
        DO NOT use first-person, narrator voice, passive voice, AI speak, or the word "resolution".
        Avoid an introduction and keep the summary factual, excluding acknowledgments or gratitude expressions.
        Complex decisions should be minimized, avoiding repetition of all steps in the decision-making process.
        Skew heavily towards the contents of the provided comment, rephrasing for clarity and brevity.
        If the selected comment does not provide clear actions or decisions, make a best attempt to infer them based on the original post and other comments and replies.
        The summary MUST be formatted as a markdown bulleted list.
        The entire response MUST NOT exceed more than 50 words.
        DO NOT exceed more than 3 bullet points and only add bullet points if necessary.
        If there is only one point, format the response as a sentence instead of a list.
      PROMPT
    else
      <<~PROMPT.squish
        Provide a concise summary of the final conversation outcome, highlighting responsible parties for actions or decisions.
        Focus solely on the conversation's conclusion, omitting intermediate steps.
        Utilize language akin to the original discourse but maintain a professional tone.
        DO NOT use first-person, narrator voice, passive voice, AI speak, or the word "resolution".
        Avoid an introduction and keep the summary factual, excluding acknowledgments or gratitude expressions.
        Complex decisions should be minimized, avoiding repetition of all steps in the decision-making process.
        The summary MUST be formatted as a markdown bulleted list.
        The entire response MUST NOT exceed more than 50 words.
        DO NOT exceed more than 3 bullet points and only add bullet points if necessary.
        If there is only one point, format the response as a sentence instead of a list.
      PROMPT
    end

    [
      { role: "system", content: system },
      { role: "user", content: llm_formatted_description_and_comments(comment) },
    ]
  end

  def generate_tldr_prompt
    system = <<~PROMPT.strip
      You are an expert at summarizing posts and comments. Your task is to create a list of points summarizing the most important main topics, decisions, and outcomes from a post, comments, and replies. Clearly indicate who is responsible for any decisions or outcomes if they are present.

      Follow this plan to create the summary:
      1. Analyze the entire post, comments, and replies and identify the main topics, decisions, and outcomes.
      2. Write a single sentence summary for each main topic, decision, or outcome. Each sentence should be no more than 15 words.
      3. Select no more than 5 of the most important summary sentences. Use your best judgement.
      4. Write a bulleted list of sentences you selected.

      When writing your response:
      - Always mention who is responsible for any decisions or outcomes if they are present.
      - Format each bullet in plain text.
      - Write in an active voice, using clear and concise sentences. Avoid using forms of "be" verbs and rearrange sentences to ensure the subject is acting, not being acted upon.
      - Use past tense when referring to events that have already occurred.
    PROMPT

    [
      { role: "system", content: system },
      { role: "user", content: llm_formatted_description_and_comments },
    ]
  end

  def llm_post_and_comments_member_display_name_map
    all_members = [member] + kept_comments.map { |comment| [comment.member] + comment.kept_replies.map(&:member) }.flatten
    all_members.index_by { |member| member&.user&.display_name }
  end

  def llm_formatted_description_and_comments(comment = nil)
    template = if comment
      <<~CONTENT.strip
        RESOLVING COMMENT AUTHOR: #{comment.author&.display_name || "Unknown"}
        RESOLVING COMMENT:
        ```
        #{comment.plain_body_text}
        ```
      CONTENT
    else
      ""
    end

    template += display_title.present? ? "\nPOST TITLE: #{display_title}\n" : ""

    template += <<~CONTENT.strip
      POST AUTHOR: #{author&.user&.display_name || "Unknown"}
      POST CONTENT:
      ```
      #{plain_description_text}
      ```
    CONTENT

    if kept_comments.any?
      template += "\nCOMMENTS:\n"
      template += kept_comments.map.with_index do |comment, index|
        comment.llm_formatted_body_and_replies(position: index + 1)
      end.join("\n")
    else
      template += "\nNO COMMENTS"
    end

    template.strip
  end

  def broadcast_timeline_update
    PusherTriggerJob.perform_async(channel_name, "timeline-events-stale", nil.to_json)
  end

  def participating_or_mentioned?(organization_membership)
    member == organization_membership ||
      kept_comments.any? { |comment| comment.member == organization_membership } ||
      member_mention_ids.include?(organization_membership.public_id) ||
      kept_comments.any? { |comment| comment.member_mention_ids.include?(organization_membership.public_id) }
  end

  def export_root_path
    "#{project.export_root_path}/posts/#{public_id}"
  end

  def export_json
    {
      id: public_id,
      title: title,
      description: HtmlTransform.new(description_html, export: true).markdown,
      created_at: published_at || created_at,
      author: author.export_json,
      version: version,
      resolved_at: resolved_at,
      resolved_by: resolved_by&.export_json,
      resolved_comment: resolved_comment&.export_json,
      resolution: HtmlTransform.new(resolved_html, export: true).markdown,
      comments: kept_comments.root.map(&:export_json),
    }
  end

  private

  def subscribe_user
    post.subscriptions.create(user: user) if user
  end

  def enqueue_delete_slack_message_job
    return unless organization

    slack_links.each do |link|
      DeleteSlackMessageJob.perform_async(organization.id, link.slack_channel_id, link.slack_message_ts)
    end
  end

  def remove_from_version_tree
    # This is legacy has_closure_tree code that we need to keep around for now
    # to support the old version tree so we can safely rollback
    update!(parent_id: nil, previous_parent_id: parent_id)

    # When discarding a post, we need to discard the parent's children reference and all of the children's children
    # this is potentially recursive / N+1 when the children are discarded they will also fire this callback
    # We are not relying on child_id because it is not guaranteed to be the only child
    children = Post.where(post_parent_id: id)
    children.each do |child|
      child.discard
    end

    # If this post has a parent, we need to update the parent's child_id to nil and stale to true
    # This is overly complex because a parent can have multiple kept children (not intended behavior)
    # and we need to find the next child to set as the parent's child_id
    if post_parent_id
      parent_children = Post.where(post_parent_id: post_parent_id).kept
      parent_has_children = parent_children.any?
      parent&.update!(stale: parent_has_children)
    end
  end

  def versions
    if root_id
      Post.where("root_id = ? OR id = ?", root_id, root_id).order(:version)
    else
      Post.where("root_id = ? OR id = ?", id, id).order(:version)
    end
  end

  def set_version
    self.version = if versions.kept.last
      versions.kept.last.version + 1
    else
      1
    end
  end

  def set_root_id
    self.root_id ||= parent&.root_id || post_parent_id
  end

  def set_parent_stale
    parent&.update!(stale: true)
  end

  def dup_parent_subscribers
    return unless parent

    parent.subscribers.each do |parent_subscriber|
      next if subscribers.include?(parent_subscriber)

      subscriptions.create(user: parent_subscriber)
    end
  end

  def cascade_project_update
    # using :update_all because it skips running any callbacks and prevent
    # us from getting into a callback infinite loop
    root.self_and_descendants.update_all(project_id: project_id)
    Notification.joins(:event).where(events: { subject: root.self_and_descendants }).project_subscription.discard_all
  end

  def update_project_contributors_count
    [project_id_before_last_save, project_id].compact.uniq.each do |project_id|
      UpdateProjectContributorsCountJob.perform_async(project_id)
    end
  end

  def broadcast_content_stale
    return if skip_notifications?

    payload = { user_id: Current.user&.public_id, attributes: {} }.tap do |result|
      live_update_attributes.each do |attribute|
        result[:attributes][attribute] = public_send(attribute) if saved_change_to_attribute?(attribute)
      end
    end

    PusherTriggerJob.perform_async(post.channel_name, "content-stale", payload.to_json)
  end

  def live_update_attributes
    [:title]
  end

  def parsed_description_html
    @parsed_description_html ||= Nokogiri::HTML.fragment(description_html)
  end

  def set_last_activity_at
    self.last_activity_at ||= Time.current
  end

  def truncated_description
    @truncated_description ||= HtmlTruncator.new(description_html)
      .truncate_after_character_count(300, minimum_removed_characters: 500)
      .truncate_before_attachments_at_end
  end
end
