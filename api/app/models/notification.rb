# frozen_string_literal: true

class Notification < ApplicationRecord
  include Discard::Model
  include PublicIdGenerator

  belongs_to :event
  belongs_to :organization_membership
  has_one :organization, through: :organization_membership
  belongs_to :target, polymorphic: true

  after_create_commit :broadcast_new_notification
  # Must use after_update_commit instead of after_discard to ensure that
  # transaction is committed and Notification is discarded by next request
  # https://github.com/jhawthorn/discard/issues/73#issue-576101350
  after_update_commit -> { broadcast_notifications_stale }, if: -> { discarded? && discarded_at_previously_changed? }
  after_destroy_commit -> { broadcast_notifications_stale }, if: -> { organization_membership && !discarded? }

  validate :user_must_have_permission_to_view_target, on: :create

  scope :unread, -> { where(read_at: nil) }
  scope :read, -> { where.not(read_at: nil) }
  scope :unarchived, -> { where(archived_at: nil) }
  scope :archived, -> { where.not(archived_at: nil) }
  scope :email, -> { where(reason: EMAIL_REASONS) }
  scope :since, ->(time) { where(created_at: time..) }
  scope :activity, -> {
    where.not(target_type: [Post, Note, Call])
      .or(where(target_scope: :reaction))
      .or(where(reason: :comment_resolved))
  }
  scope :home_inbox, -> {
    where(target_type: [Post, Note, Call])
      .where.not(reason: :comment_resolved)
      .and(
        where.not(target_scope: :reaction).or(where(target_scope: nil)),
      )
  }
  scope :most_recent_per_target_and_member, -> {
    where(
      <<~SQL.squish,
        NOT EXISTS (
          SELECT
            target_id,
            target_type,
            target_scope,
            organization_membership_id,
            created_at
          FROM
            notifications AS other_notifications
          WHERE
            other_notifications.discarded_at IS NULL AND
            notifications.created_at < other_notifications.created_at AND
            notifications.target_id = other_notifications.target_id AND
            notifications.target_type = other_notifications.target_type AND
            notifications.target_scope <=> other_notifications.target_scope AND
            notifications.organization_membership_id = other_notifications.organization_membership_id
        )
      SQL
    )
  }

  SERIALIZER_EAGER_LOAD = [:organization, :event, organization_membership: OrganizationMembership::SERIALIZER_EAGER_LOAD]
  SERIALIZER_PRELOAD = {
    target: Post::FEED_INCLUDES,
    event: [
      actor: OrganizationMembership::SERIALIZER_EAGER_LOAD,
      subject: [
        # Post
        :project,
        :attachments,
        # Comment
        :attachment,
        # Custom Reaction
        :custom_content,
        member: OrganizationMembership::SERIALIZER_EAGER_LOAD,
        parent: { member: OrganizationMembership::SERIALIZER_EAGER_LOAD },
        # FollowUp
        organization_membership: OrganizationMembership::SERIALIZER_EAGER_LOAD,
        unshown_follow_ups: { organization_membership: OrganizationMembership::SERIALIZER_EAGER_LOAD },
        # Call
        room: :organization,
        # Comment, PostFeedbackRequest, Reaction, Permission, FollowUp
        subject: [
          :attachments,
          member: OrganizationMembership::SERIALIZER_EAGER_LOAD,
          post: :attachments,
          subject: :attachments,
          room: :organization,
        ],
      ],
    ],
  }
  scope :serializer_preload, -> { eager_load(SERIALIZER_EAGER_LOAD).preload(SERIALIZER_PRELOAD) }

  delegate :subject, :actor, to: :event
  delegate :user, :slack_client, :slack_user_id, to: :organization_membership, allow_nil: true
  delegate :slug, to: :organization, prefix: true
  delegate :text, to: :summary, prefix: true
  delegate :blocks, to: :summary, prefix: true

  enum :reason,
    {
      mention: 0,
      parent_subscription: 1,
      author: 2,
      feedback_requested: 3,
      project_subscription: 4,
      permission_granted: 5,
      comment_resolved: 6,
      # post_reference: 7 is deprecated
      added: 8,
      subject_archived: 9,
      follow_up: 10,
      post_resolved: 11,
      post_resolved_from_comment: 12,
      processing_complete: 13,
    }

  EMAIL_REASONS = [
    reasons[:mention],
    reasons[:parent_subscription],
    reasons[:author],
    reasons[:feedback_requested],
    reasons[:project_subscription],
    reasons[:permission_granted],
    reasons[:added],
    reasons[:subject_archived],
    reasons[:follow_up],
    reasons[:processing_complete],
  ].freeze

  enum :target_scope, { feedback_request: 0, reaction: 1, permission: 2 }

  def self.mark_all_read
    update_all(read_at: Time.current)
  end

  def read?
    !!read_at
  end

  def mark_read!
    update!(read_at: Time.current)
  end

  def mark_unread!
    update!(read_at: nil)
  end

  def archived?
    !!archived_at
  end

  def archive!
    update!(archived_at: Time.current)
  end

  def unarchive!
    update!(archived_at: nil)
  end

  def summary
    subject.notification_summary(notification: self)
  end

  def reply_to_body_preview
    return unless subject.respond_to?(:notification_reply_to_body_preview)

    subject.notification_reply_to_body_preview(notification: self)
  end

  def body_preview
    subject.notification_body_preview(notification: self)
  end

  def body_preview_prefix
    return if reason.in?(["follow_up", "project_subscription", "post_resolved", "post_resolved_from_comment"])
    return "#{actor.display_name} mentioned you" if reason == "mention"

    if subject.respond_to?(:notification_body_preview_prefix)
      prefix = subject.notification_body_preview_prefix(notification: self)
      return prefix if prefix.present?
    end

    actor&.display_name
  end

  def body_preview_prefix_fallback
    return "#{actor.display_name} posted" if reason == "project_subscription"
    return "#{actor.display_name} resolved post" if reason == "post_resolved"
    return "#{actor.display_name} resolved post from comment" if reason == "post_resolved_from_comment"

    nil
  end

  def preview_url
    subject.notification_preview_url(notification: self)
  end

  def preview_is_canvas
    subject.notification_preview_is_canvas(notification: self)
  end

  def cta_button_text
    subject.notification_cta_button_text
  end

  def notifications_for_same_member_and_target
    Notification.where(organization_membership: organization_membership, target: target, target_scope: target_scope)
  end

  def subtarget
    subject.try(:notification_subtarget)
  end

  def deliver_email_later
    return if !user.email_notifications_enabled? || user.notifications_paused?

    ScheduleUserNotificationsEmailJob.perform_async(user.id, created_at.iso8601)
  end

  def deliver_slack_message_later
    return if !organization_membership.slack_notifications_enabled? || slack_message_delivered? || user.notifications_paused?

    DeliverNotificationSlackMessageJob.perform_async(id)
  end

  def deliver_slack_message!
    return unless organization_membership.linked_to_slack?
    return if slack_message_delivered?

    message_params = {
      text: summary.text,
      blocks: [SlackBlockKit.mrkdwn_section_block(text: summary.slack_mrkdwn)],
      channel: slack_user_id,
      unfurl_links: false,
      unfurl_media: false,
    }

    if subject.respond_to?(:notification_body_slack_blocks)
      message_params[:attachments] = [{
        blocks: subject.notification_body_slack_blocks,
        color: Campsite::BRAND_ORANGE_HEX_CODE,
      }]
    end

    message = slack_client.chat_postMessage(message_params)
    update!(slack_message_ts: message["ts"])
  end

  def delete_slack_message_later
    return unless slack_message_delivered?

    DeleteNotificationSlackMessageJob.perform_async(id)
  end

  def delete_slack_message!
    return if !slack_message_delivered? || !slack_user_id

    slack_client.chat_delete(channel: slack_user_id, ts: slack_message_ts)
  end

  def deliver_web_push_notification_later
    return if user.notifications_paused?

    user.web_push_subscriptions.each do |sub|
      DeliverWebPushNotificationJob.perform_async(id, sub.id)
    end
  end

  def inbox_key
    Digest::SHA1.hexdigest([target_scope, target_type, target.id].compact.join(":")).first(PublicIdGenerator::PUBLIC_ID_LENGTH)
  end

  def inbox?
    target_type.in?([Post, Note, Call].map(&:to_s)) && !comment_resolved? && !reaction?
  end

  def follow_up_subject
    case subject
    when Post, Comment, Call
      subject
    when PostFeedbackRequest
      subject.post
    when FollowUp, Reaction
      subject.subject
    end
  end

  def reaction
    if subject.is_a?(Reaction)
      subject
    end
  end

  def post_target
    if target.is_a?(Post)
      target
    end
  end

  def self.discard_home_inbox_notifications(member:, follow_up_subject:)
    target = case follow_up_subject
    when Comment
      follow_up_subject.subject
    else
      follow_up_subject
    end

    where(organization_membership: member, target: target).home_inbox.discard_all
  end

  private

  def broadcast_new_notification
    PusherTriggerJob.perform_async(
      user.channel_name,
      "new-notification",
      { **NotificationSerializer.render_as_hash(self), skip_push: user.notifications_paused? }.to_json,
    )
  end

  def broadcast_notifications_stale
    PusherTriggerJob.perform_async(user.channel_name, "notifications-stale", nil.to_json)
  end

  def slack_message_delivered?
    !!slack_message_ts
  end

  def user_must_have_permission_to_view_target
    return if Pundit.policy!(user, target).show?

    errors.add(:target, "user doesn't have permission to view target")
  end
end
