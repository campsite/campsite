# frozen_string_literal: true

class Note < ApplicationRecord
  include Discard::Model
  include PublicIdGenerator
  include Mentionable
  include Eventable
  include Reactable
  include ActionView::Helpers::UrlHelper
  include ActionView::Helpers::SanitizeHelper
  include ImgixUrlBuilder
  include SearchConfigBuilder
  include Commentable
  include FollowUpable
  include Favoritable
  include Pinnable
  include Referenceable
  include AttachmentsReorderable
  include ResourceMentionable

  FILE_LIMIT = Float::INFINITY

  belongs_to :member, class_name: "OrganizationMembership", foreign_key: :organization_membership_id
  belongs_to :project, optional: true

  has_many :attachments, as: :subject, dependent: :destroy
  has_many :permissions, as: :subject, dependent: :destroy_async
  has_many :kept_permissions, -> { kept }, class_name: "Permission", as: :subject
  has_many :subscriptions, class_name: "UserSubscription", as: :subscribable
  has_many :subscribers, through: :subscriptions, source: :user
  has_many :views, class_name: "NoteView", dependent: :destroy
  has_many :non_member_views, class_name: "NonMemberNoteView", dependent: :destroy_async
  has_many :timeline_events, as: :subject, dependent: :destroy_async

  enum :project_permission, { none: 0, view: 1, edit: 2 }, prefix: :project
  enum :visibility, { default: 0, public: 1 }, suffix: true

  before_create :set_initial_timestamps

  after_create_commit :subscribe_user
  after_save :broadcast_content_stale, if: -> { live_update_attributes.any? { |attribute| saved_change_to_attribute?(attribute) } }
  after_update_commit :revalidate_public_static_cache

  delegate :organization, :user, to: :member
  delegate :mrkdwn_link, to: SlackBlockKit

  SERIALIZER_EAGER_LOADS = [
    project: Project::SERIALIZER_INCLUDES,
    member: OrganizationMembership::SERIALIZER_EAGER_LOAD,
    unshown_follow_ups: { organization_membership: OrganizationMembership::SERIALIZER_EAGER_LOAD },
  ].freeze
  SERIALIZER_PRELOADS = [
    :permissions,
  ]

  scope :serializer_preload, -> {
    eager_load(*SERIALIZER_EAGER_LOADS).preload(*SERIALIZER_PRELOADS)
  }
  scope :only_user, ->(user) { where(member: { user_id: user.id }) }
  scope :viewable_by, ->(user) {
    scope = joins(:member).left_outer_joins(:permissions).left_outer_joins(:project)

    scope
      # the user is the author
      .where(member: { user_id: user.id })
      # the user has view or edit permissions
      .or(scope.where(permissions: { user: user, discarded_at: nil, action: [:view, :edit] }))
      # the project is not private and user can view all non-private projects
      .or(scope.where(project: { private: false }).merge(Project.with_view_all_permission_for(user, projects_table_alias: :project)))
      # the user has permission to view the project
      .or(scope.merge(Project.with_project_membership_for(user, projects_table_alias: :project)))
  }

  searchkick \
    callbacks: Rails.env.test? ? :inline : :async,
    text_start: [:title, :description, :comments_content, :user_name, :user_username],
    word_start: [:title, :description, :comments_content, :user_name, :user_username],
    highlight: [:title, :description, :comments_content],
    filterable: [:organization_id, :discarded_at, :project_id, :user_id],
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
      title: title,
      description: description_text,
      comments_content: searchable_comment_content,
      created_at: created_at,
      organization_id: member&.organization_id,
      user_id: member&.user_id,
      user_username: member&.user&.username,
      user_name: member&.user&.name,
      discarded_at: discarded_at,
      project_id: project_id,
    }
  end

  scope :search_import, -> { includes(member: :user).preload(:kept_comments) }

  def self.scoped_search(
    query:,
    organization:,
    user_id: nil,
    project_public_id: nil,
    limit: 250
  )
    where = {
      organization_id: organization.id,
      discarded_at: nil,
    }

    where[:user_id] = user_id if user_id
    where[:project_id] = Project.find_by(public_id: project_public_id)&.id if project_public_id

    fields = [
      # exact-match phrases get the highest boost
      { title: :phrase, boost: 3 },
      { description: :phrase, boost: 3 },
      { comments_content: :phrase, boost: 3 },
      { user_name: :phrase, boost: 3 },
      { user_username: :phrase, boost: 3 },

      # boost phrase partial matches
      { title: :text_start, boost: 2 },
      { description: :text_start, boost: 2 },
      { comments_content: :text_start, boost: 2 },
      { user_name: :text_start, boost: 2 },
      { user_username: :text_start, boost: 2 },

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
      limit: limit,
      load: false,
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
      limit: limit,
      load: false,
    )
  end

  def api_type_name
    "Note"
  end

  def author
    member
  end

  def channel_name
    "note-#{public_id}"
  end

  def presence_channel_name
    "presence-note-#{public_id}"
  end

  # provide a known org to prevent N+1s
  def path(organization = nil)
    (organization || self.organization).path + "/notes/#{public_id}"
  end

  # provide a known org to prevent N+1s
  def url(organization = nil)
    Campsite.app_url(path: path(organization))
  end

  # provide a known org to prevent N+1s
  def public_share_url(organization = nil)
    Campsite.app_url(path: public_share_path(organization))
  end

  def description_text
    RichText.new(description_html).add_trailing_newlines_to_block_elements.text.strip
  end

  def mailer_description_html
    @mailer_description_html ||= RichText.new(description_html)
      .replace_mentions_with_links(members_base_url: organization.members_base_url)
      .replace_post_attachments_with_images(image_url_key: :email_url)
      .replace_resource_mentions_with_links(organization)
      .replace_link_unfurls_with_html
      .to_s
  end

  def mailer_truncated_description_html
    @mailer_truncated_description_html ||= HtmlTruncator.new(mailer_description_html).truncate_after_css("p").to_html
  end

  def truncated_description_html
    return unless description_html

    HtmlTruncator.new(description_html).truncate_after_character_count(300, minimum_removed_characters: 500).to_html
  end

  def truncated_description_text
    description_text&.truncate(60, separator: /\s/)
  end

  def mentionable_attribute
    :description_html
  end

  def subscribed?(user)
    subscribers.include?(user)
  end

  def description_thumbnail_base_url
    return unless description_html

    path = "/v1/notes/#{public_id}/thumbnails/#{contents_hash}"

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

  def event_actor
    @event_actor || member
  end

  def event_organization
    organization
  end

  def notification_summary(notification:)
    reason = notification.reason
    actor = notification.actor
    organization = notification.organization
    url = self.url(organization)
    title = notification_title_plain(notification)

    case reason
    when "mention"
      return NotificationSummary.new(
        text: "#{actor.display_name} mentioned you in #{title}",
        blocks: [
          {
            text: { content: actor.display_name, bold: true },
          },
          {
            text: { content: " mentioned you on " },
          },
          notification_title_block(notification),
        ],
        slack_mrkdwn: "#{actor.display_name} #{mrkdwn_link(url: url, text: "mentioned you in #{title}")}",
        email: link_to(content_tag(:b, actor.display_name), "#{organization.url}/people/#{actor.username}", target: "_blank", rel: "noopener") + " mentioned you in a note",
      )
    end

    raise "Couldn't create summary for Note #{id} (reason #{reason})"
  end

  def notification_body_preview(notification:)
    description_text&.truncate(280, separator: /\s/)
  end

  def follow_up_body_preview
    description_text&.truncate(280, separator: /\s/)
  end

  def follow_up_summary_blocks(follow_up_member:)
    is_self_follow_up = author == follow_up_member
    relative_note_author = is_self_follow_up ? "Your" : "#{author.display_name}'s"

    [
      {
        text: { content: relative_note_author, bold: !is_self_follow_up },
      },
      {
        text: { content: " note: " },
      },
      {
        text: { content: title, bold: true },
      },
    ]
  end

  def notification_title_plain(notification)
    if title.present?
      title
    elsif member == notification.organization_membership
      "your document"
    elsif member == notification.actor
      "their document"
    else
      "#{user.display_name}'s document"
    end
  end

  def notification_title_block(notification)
    if title.present?
      {
        text: { content: title, bold: true },
      }
    elsif member == notification.organization_membership
      {
        text: { content: "your document" },
      }
    elsif member == notification.actor
      {
        text: { content: "their document" },
      }
    else
      {
        text: { content: "#{user.display_name}'s document" },
      }
    end
  end

  def notification_target_title
    title || "#{user.display_name}’s document"
  end

  def notification_preview_url(notification:)
    nil
  end

  def notification_preview_is_canvas(notification:)
    false
  end

  attr_writer :event_actor

  def discard_by_actor(actor)
    @event_actor = actor
    discard
    comments.discard_all_by_actor(actor)
    reactions.discard_all_by_actor(actor)
    @event_actor = nil
  end

  def viewer?(user)
    has_any_permissions?(user: user, actions: [:view, :edit])
  end

  def editor?(user)
    has_any_permissions?(user: user, actions: [:edit])
  end

  def project_viewer?(user)
    return false if !user || !project

    (project_view? || project_edit?) && Pundit.policy!(user, project).show?
  end

  def project_editor?(user)
    return false if !user || !project

    project_edit? && Pundit.policy!(user, project).show?
  end

  def self.permitted_users_async(ids, membership)
    scope = Permission.where(subject_id: ids, subject_type: Note)
      .kept
      .eager_load(:user)
      .load_async

    AsyncPreloader.new(scope) do |scope|
      scope.each_with_object({}) do |permission, result|
        result[permission.subject_id] ||= []
        result[permission.subject_id] << permission
      end
    end
  end

  def revalidate_public_static_cache_path
    params = {
      secret: Rails.application.credentials.vercel.revalidate_static_cache,
      rpath: public_share_path,
    }

    "/api/revalidate?#{params.to_query}"
  end

  def slugified_id
    if title.blank?
      "untitled" + "-" + public_id
    else
      trimmed_title = title.split[0..9].join(" ")
      trimmed_title.to_s.parameterize + "-" + public_id
    end
  end

  def update_content_updated_at_column
    update_columns(content_updated_at: Time.current)
    update_last_activity_at_column
  end

  def update_last_activity_at_column
    update_columns(last_activity_at: [most_recent_kept_comment&.created_at, content_updated_at].compact.max)
  end

  def favoritable_name(member = nil)
    title
  end

  def add_to_project!(project:, permission: Note.project_permissions[:view])
    update!(project: project, project_permission: permission)
  end

  def remove_from_project!
    update!(project: nil, project_permission: :none)
  end

  def broadcast_timeline_update
    PusherTriggerJob.perform_async(channel_name, "timeline-events-stale", nil.to_json)
  end

  def resource_mentionable_parsed_html
    @resource_mentionable_parsed_html ||= Nokogiri::HTML.fragment(description_html)
  end

  def export_root_path
    # exporting a note without a project is not supported
    "#{project.export_root_path}/docs/#{public_id}"
  end

  def export_json
    {
      id: public_id,
      title: title,
      description: HtmlTransform.new(description_html, export: true).markdown,
      created_at: created_at,
      author: author.export_json,
      comments: kept_comments.root.map(&:export_json),
    }
  end

  private

  def public_share_path(organization = nil)
    org_slug = (organization || self.organization).slug
    "/#{org_slug}/p/notes/#{slugified_id}"
  end

  def subscribe_user
    subscriptions.create(user: user)
  end

  def has_any_permissions?(user:, actions:)
    return true if member.user == user

    permissions.any? { |permission| permission.kept? && permission.user == user && actions.include?(permission.action.to_sym) }
  end

  def broadcast_content_stale
    payload = { user_id: Current.user&.public_id, attributes: {} }.tap do |result|
      live_update_attributes.each do |attribute|
        result[:attributes][attribute] = public_send(attribute) if saved_change_to_attribute?(attribute)
      end
    end

    PusherTriggerJob.perform_async(channel_name, "content-stale", payload.to_json)
  end

  def live_update_attributes
    [:title]
  end

  def revalidate_public_static_cache
    is_or_was_public = public_visibility? || visibility_previously_was == "public"

    should_revalidate = saved_change_to_title? || saved_change_to_description_html? || saved_change_to_visibility? || saved_change_to_discarded_at?

    return unless is_or_was_public && should_revalidate

    RevalidatePublicNoteStaticCacheJob.perform_async(id)
  end

  def set_initial_timestamps
    self.last_activity_at ||= Time.current
    self.content_updated_at ||= Time.current
  end
end
