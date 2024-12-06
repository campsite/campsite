# frozen_string_literal: true

class Comment < ApplicationRecord
  include Discard::Model
  include PublicIdGenerator
  include Eventable
  include Mentionable
  include ActionView::Helpers::UrlHelper
  include ActionView::Helpers::SanitizeHelper
  include Reactable
  include TaskUpdatable
  include FollowUpable
  include Referenceable
  include AttachmentsReorderable
  include ResourceMentionable

  FILE_LIMIT = 10
  PUBLIC_API_ALLOWED_ORDER_FIELDS = [:created_at]

  belongs_to :subject, polymorphic: true
  belongs_to :attachment, optional: true
  belongs_to :member, class_name: "OrganizationMembership", foreign_key: "organization_membership_id", optional: true
  belongs_to :resolved_by, class_name: "OrganizationMembership", optional: true
  belongs_to :parent, class_name: "Comment", optional: true
  belongs_to :integration, optional: true
  belongs_to :oauth_application, optional: true
  has_many :replies, foreign_key: :parent_id, class_name: "Comment", dependent: :destroy_async
  has_many :kept_replies, -> { kept }, foreign_key: :parent_id, class_name: "Comment"
  has_many :attachments, as: :subject, dependent: :destroy
  has_many :timeline_events, as: :subject, dependent: :destroy_async

  delegate :user, to: :member, allow_nil: true
  delegate :mrkdwn_section_block, :mrkdwn_link, to: SlackBlockKit
  delegate :organization, :subscribers, :subscriptions, :notification_title_plain, :notification_title_block, :notification_title_block, to: :subject

  counter_culture :subject, column_name: :comments_count
  counter_culture :attachment, column_name: :comments_count
  counter_culture :subject,
    column_name: proc { |comment| comment.resolved? ? :resolved_comments_count : nil },
    column_names: -> { { Comment.resolved => :resolved_comments_count } }
  counter_culture :parent, column_name: :replies_count

  after_create_commit :subscribe_user, if: -> { user.present? }
  after_commit :broadcast_post_comments_stale
  after_save :reindex_comments, if: -> { Searchkick.callbacks? && (saved_change_to_discarded_at? || saved_change_to_body_html?) }

  scope :root, -> { where(parent_id: nil) }
  scope :canvas_comments, -> { where.not(x: nil).where.not(y: nil) }
  scope :resolved, -> { where.not(resolved_at: nil) }

  scope :serializer_preloads, -> {
    comment_includes = [
      :attachments,
      :attachment,
      :parent,
      :integration,
      :oauth_application,
      :timeline_events,
      member: OrganizationMembership::SERIALIZER_EAGER_LOAD,
      resolved_by: OrganizationMembership::SERIALIZER_EAGER_LOAD,
      unshown_follow_ups: { organization_membership: OrganizationMembership::SERIALIZER_EAGER_LOAD },
    ]
    root_includes = comment_includes + [kept_replies: comment_includes]
    eager_load(root_includes).preload(timeline_events: TimelineEvent::SERIALIZER_PRELOADS)
  }
  scope :eager_load_user, -> {
    eager_load(member: :user)
  }

  scope :not_private, -> {
    joins("LEFT OUTER JOIN posts ON posts.id = #{Comment.table_name}.subject_id AND #{Comment.table_name}.subject_type = '#{Post}'")
      .joins("LEFT OUTER JOIN projects ON projects.id = posts.project_id")
      .where("posts.project_id IS NULL OR projects.private = False")
  }

  scope :viewable_by, ->(user) {
    where(subject: [Post.viewable_by(user), Note.viewable_by(user)])
  }

  scope :viewable_by_api_actor, ->(api_actor) {
    where(subject: [Post.viewable_by_api_actor(api_actor)])
  }

  def self.create_comment(params:, member:, subject: nil, parent: nil, integration: nil, oauth_application: nil, skip_notifications: false)
    comment = CreateComment.new(
      member: member,
      params: params,
      subject: subject,
      parent: parent,
      integration: integration,
      oauth_application: oauth_application,
      skip_notifications: skip_notifications,
    ).run

    post_subject = subject || parent.subject
    if member && post_subject.is_a?(Post)
      post_subject.kept_feedback_requests.find_by(member: member)&.update(has_replied: true)
    end

    comment
  end

  def api_type_name
    "Comment"
  end

  # provide a known org to prevent N+1s
  def path(organization = nil)
    subject.path(organization || self.organization) + "#comment-#{public_id}"
  end

  # provide a known org to prevent N+1s
  def url(organization = nil)
    Campsite.app_url(path: path(organization))
  end

  def canvas_preview_url(preferred_size = 96)
    if (x = self.x) && (y = self.y) && (attachment = self.attachment) && attachment.width && attachment.height
      size = [preferred_size, attachment.width, attachment.height].min
      min_x = (x - size / 2).clamp(0, attachment.width - size)
      min_y = (y - size / 2).clamp(0, attachment.height - size)
      attachment.build_imgix_url(attachment.file_path, {
        auto: "compress,format",
        rect: "#{min_x},#{min_y},#{size},#{size}",
        w: size,
        h: size,
      })
    end
  end

  def reply?
    !!parent
  end

  def replies
    parent_id.nil? ? kept_replies : Comment.none
  end

  def resolved?
    resolved_at.present?
  end

  def resolve!(actor:)
    @event_actor = actor
    update!(resolved_at: Time.current, resolved_by: actor)
    @event_actor = nil
  end

  def unresolve!(actor:)
    @event_actor = actor
    update!(resolved_at: nil, resolved_by: nil)
    @event_actor = nil
  end

  def update_task(index:, checked:)
    update_column(:body_html, update_checked_task(content: body_html, index: index, checked: checked))
  end

  def build_slack_blocks
    BuildSlackBlocks.new(comment: self).run
  end

  def slack_body_html
    @slack_body_html ||= RichText.new(body_html)
      .replace_mentions_with_links(members_base_url: organization.members_base_url)
      .replace_resource_mentions_with_links(organization)
      .replace_link_unfurls_with_links
      .to_s
  end

  def plain_body_text(strip_quotes: false)
    HtmlTransform.new(body_html, strip_quotes: strip_quotes).plain_text
  end

  def plain_body_text_truncated_at(strip_quotes: false, limit:)
    lines = plain_body_text(strip_quotes: strip_quotes)&.lines

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

  def post_preview_text
    display_name = author.user.display_name
    if (body_text = plain_body_text_truncated_at(strip_quotes: true, limit: 140).presence)
      "#{display_name}: #{body_text}"
    elsif attachments.any?
      "#{display_name} shared an attachment"
    else
      "#{display_name} posted a comment"
    end
  end

  # Events and notifications

  def self.discard_all_by_actor(actor)
    @event_actor = actor
    discard_all
    find_each { |comment| comment.reactions.discard_all_by_actor(actor) }
    @event_actor = nil
  end

  def discard_by_actor(actor)
    @event_actor = actor
    discard
    replies.discard_all_by_actor(actor)
    reactions.discard_all_by_actor(actor)
    @event_actor = nil
  end

  def maybe_unresolve_post!(actor:)
    return unless subject.is_a?(Post) && subject.resolved_comment == self

    subject.unresolve!(actor: actor)
  end

  def author
    integration || oauth_application || member || OrganizationMembership::NullOrganizationMembership.new(system: true)
  end

  def event_actor
    @event_actor || member || integration || oauth_application
  end

  def event_actor_display_name
    event_actor&.display_name
  end

  def event_organization
    organization
  end

  def notification_summary(notification:)
    sender = notification.actor
    recipient = notification.organization_membership

    actor = notification.actor || author
    reason = notification.reason
    organization = notification.organization
    title = notification_title_plain(notification)
    subject_url = subject.url(organization)
    email_in_context = link_to(content_tag(:b, title), subject_url, target: "_blank", rel: "noopener")
    url = self.url(organization)

    if reply?
      whose = if parent.member == recipient
        "your comment"
      elsif parent.member == sender
        "their comment"
      else
        "#{parent.author.display_name}'s comment"
      end

      whose_blocks = if parent.member == recipient
        [{
          text: { content: "your comment" },
        }]
      elsif parent.member == sender
        [{
          text: { content: "their comment" },
        }]
      else
        [
          {
            text: { content: "#{parent.author.display_name}'s", bold: true },
          },
          {
            text: { content: " comment" },
          },
        ]
      end

      if reason == "mention"
        return NotificationSummary.new(
          text: "#{actor.display_name} mentioned you in a reply",
          blocks: [
            {
              text: { content: actor.display_name, bold: true },
            },
            {
              text: { content: " mentioned you in a reply" },
            },
          ],
          slack_mrkdwn: "#{actor.display_name} #{mrkdwn_link(url: url, text: "mentioned you in a reply")}",
          email: link_to(content_tag(:b, actor.display_name), "#{organization.url}/people/#{actor.username}", target: "_blank", rel: "noopener") + " mentioned you in a reply on " + email_in_context,
        )
      else
        return NotificationSummary.new(
          text: "#{actor.display_name} replied to #{whose}",
          blocks: [
            {
              text: { content: actor.display_name, bold: true },
            },
            {
              text: { content: " replied to " },
            },
            *whose_blocks,
          ],
          slack_mrkdwn: "#{actor.display_name} #{mrkdwn_link(url: url, text: "replied")} to #{whose}",
          email: link_to(content_tag(:b, actor.display_name), "#{organization.url}/people/#{actor.username}", target: "_blank", rel: "noopener") + " replied to #{whose} on " + email_in_context,
        )
      end
    elsif reason == "mention"
      return NotificationSummary.new(
        text: "#{actor.display_name} mentioned you in a comment",
        blocks: [
          {
            text: { content: actor.display_name, bold: true },
          },
          {
            text: { content: " mentioned you in a comment" },
          },
        ],
        slack_mrkdwn: "#{actor.display_name} #{mrkdwn_link(url: url, text: "mentioned you in a comment")}",
        email: link_to(content_tag(:b, actor.display_name), "#{organization.url}/people/#{actor.username}", target: "_blank", rel: "noopener") + " mentioned you in a comment on " + email_in_context,
      )
    elsif reason == "parent_subscription"
      return NotificationSummary.new(
        text: "#{actor.display_name} commented on #{title}",
        blocks: [
          {
            text: { content: actor.display_name, bold: true },
          },
          {
            text: { content: " commented on " },
          },
          notification_title_block(notification),
        ],
        slack_mrkdwn: "#{actor.display_name} #{mrkdwn_link(url: url, text: "commented")} on #{mrkdwn_link(url: subject_url, text: title)}",
        email: link_to(content_tag(:b, actor.display_name), "#{organization.url}/people/#{actor.username}", target: "_blank", rel: "noopener") + " commented on " + email_in_context,
      )
    elsif reason == "comment_resolved"
      return NotificationSummary.new(
        text: "#{actor.display_name} resolved your comment",
        blocks: [
          {
            text: { content: actor.display_name, bold: true },
          },
          {
            text: { content: " resolved your comment" },
          },
        ],
        slack_mrkdwn: "✅ #{actor.display_name} resolved your #{mrkdwn_link(url: url, text: "comment")}",
        email: "not-supported",
      )
    end

    raise "Couldn't create summary for Comment #{id} (reason #{reason})"
  end

  def mentionable_attribute
    :body_html
  end

  def notification_reply_to_body_preview(notification:)
    if reply?
      parent.notification_body_preview(notification: notification)
    elsif notification.comment_resolved?
      plain_body_text_truncated_at(strip_quotes: true, limit: 280)
    end
  end

  def notification_body_preview(notification:)
    return if notification.comment_resolved?

    if (body_text = plain_body_text_truncated_at(strip_quotes: true, limit: 280).presence)
      body_text
    elsif attachments.any?
      "#{attachments.size} #{"attachment".pluralize(attachments.size)}"
    end
  end

  def notification_body_preview_prefix(notification:)
    reply? ? "#{author.display_name} replied" : "#{author.display_name} commented"
  end

  def follow_up_body_preview
    plain_body_text_truncated_at(strip_quotes: true, limit: 280)
  end

  def follow_up_summary_blocks(follow_up_member:)
    is_self_follow_up = author == follow_up_member
    relative_comment_author = is_self_follow_up ? "Your" : "#{author.display_name}'s"
    comment_subject_type = subject.is_a?(Post) ? "post" : "document"
    comment_subject_author = comment_subject_type == "post" ? subject.author : subject.member
    relative_comment_subject_author = comment_subject_author == follow_up_member ? "your" : "#{comment_subject_author.display_name}'s"

    [
      {
        text: { content: relative_comment_author, bold: !is_self_follow_up },
      },
      {
        text: { content: " comment on " },
      },
      {
        text: { content: relative_comment_subject_author, bold: (comment_subject_author != follow_up_member) },
      },
      {
        text: { content: " #{comment_subject_type}" },
      },
    ]
  end

  def notification_preview_url(notification:)
    if subject.is_a?(Post)
      canvas_preview_url || subject.sorted_attachments.first&.thumbnail_url
    end
  end

  def notification_preview_is_canvas(notification:)
    !!canvas_preview_url
  end

  def notification_body_slack_blocks
    block_builder = BuildSlackBlocks.new(comment: self)

    [
      *block_builder.body_blocks,
      *block_builder.preview_blocks,
      *block_builder.attachment_context_blocks,
    ].compact
  end

  # Mailers

  def mailer_body_html
    @mailer_body_html ||= RichText.new(body_html)
      .replace_mentions_with_links(members_base_url: organization.members_base_url)
      .replace_resource_mentions_with_links(organization)
      .replace_link_unfurls_with_links
      .to_s
  end

  def mailer_hero_attachments
    attachments&.select(&:mailer_hero?)
  end

  def origami_attachments
    attachments&.select(&:origami?)
  end

  def principle_attachments
    attachments&.select(&:principle?)
  end

  def lottie_attachments
    attachments&.select(&:lottie?)
  end

  def stitch_attachments
    attachments&.select(&:stitch?)
  end

  def sorted_attachments
    attachments.sort_by(&:position)
  end

  def resource_mentionable_parsed_html
    @resource_mentionable_parsed_html ||= Nokogiri::HTML.fragment(body_html)
  end

  def llm_formatted_body_and_replies(position:)
    template = <<~CONTENT.strip
      #{position}. COMMENT BY: #{author&.user&.display_name || "Unknown"}
      COMMENT CONTENT:
      ```
      #{plain_body_text}
      ```
    CONTENT

    if kept_replies.any?
      template += "\nREPLIES:\n"
      template += kept_replies.map do |reply|
        <<~CONTENT.strip
          - REPLY BY: #{reply.author&.user&.display_name || "Unknown"}
            REPLY CONTENT:
          ```
          #{reply.plain_body_text}
          ```
        CONTENT
      end.join("\n")
    end

    template
  end

  def broadcast_timeline_update
    broadcast_post_comments_stale
  end

  def subject_title
    if subject.is_a?(Post)
      subject.display_title
    elsif subject.is_a?(Note)
      subject.title
    end
  end

  def export_json
    base = {
      id: public_id,
      body: HtmlTransform.new(body_html, export: true).markdown,
      created_at: created_at,
      author: author.export_json,
      resolved_at: resolved_at,
      resolved_by: resolved_by&.export_json,
    }

    if parent_id.blank?
      base[:replies] = kept_replies.map(&:export_json)
    end

    base
  end

  private

  def subscribe_user
    return if user.is_a?(User::NullUser)
    return unless subject.is_a?(Post) || subject.is_a?(Note)
    return if subject.subscribed?(user)

    subject.subscriptions.create(user: user)
  end

  def broadcast_post_comments_stale
    return if skip_notifications?
    return unless subject.is_a?(Post) || subject.is_a?(Note)

    PusherTriggerJob.perform_async(
      subject.channel_name,
      "comments-stale",
      {
        # for backwards compatibility with old comments
        post_id: subject.public_id,
        subject_id: subject.public_id,
        user_id: user&.public_id,
        attachment_id: attachment&.public_id,
      }.to_json,
    )
  end

  def reindex_comments
    return unless subject.is_a?(Post) || subject.is_a?(Note)

    subject.reindex(mode: :async)
  end
end
