# frozen_string_literal: true

class FollowUp < ApplicationRecord
  include PublicIdGenerator
  include Eventable
  include ActionView::Helpers::UrlHelper

  belongs_to :organization_membership
  has_one :organization, through: :organization_membership
  has_one :user, through: :organization_membership
  delegate :slug, to: :organization, prefix: true

  belongs_to :subject, polymorphic: true

  validates :show_at, presence: true

  after_commit :enqueue_show_follow_up_job, if: :saved_change_to_show_at?
  after_destroy_commit -> { broadcast_follow_ups_stale }, if: -> { organization_membership }

  scope :serializer_preload, -> {
    eager_load(organization_membership: OrganizationMembership::SERIALIZER_EAGER_LOAD)
      .preload(
        subject: [
          :subject,
          # want to know who made a comment, post, note
          { member: OrganizationMembership::SERIALIZER_EAGER_LOAD },
          :integration,
          :oauth_application,
          # want to which space a post was made in
          :project,
          # want to know authorship for post/note a comment was made for
          subject: [
            { member: OrganizationMembership::SERIALIZER_EAGER_LOAD },
            :integration,
            :oauth_application,
            :project,
          ],
        ],
      )
  }
  scope :unshown, -> { where(shown_at: nil) }

  delegate :mrkdwn_link, to: SlackBlockKit
  delegate :url, to: :subject

  def api_type_name
    "FollowUp"
  end

  def inbox_key
    Digest::SHA1.hexdigest([api_type_name, subject.api_type_name, subject.id].compact.join(":")).first(PublicIdGenerator::PUBLIC_ID_LENGTH)
  end

  def show!
    update!(shown_at: Time.current)
  end

  def shown?
    shown_at.present?
  end

  def needs_showing?
    !shown? && show_at <= Time.current
  end

  def event_actor
    organization_membership
  end

  def event_organization
    organization_membership.organization
  end

  def notification_summary(notification:)
    NotificationSummary.new(
      text: "Follow up on #{subject.notification_title_plain(notification)}",
      blocks: [
        { text: { content: "Follow up on " } },
        subject.notification_title_block(notification),
      ],
      slack_mrkdwn: "Follow up on #{mrkdwn_link(url: subject.url, text: subject.notification_title_plain(notification))}",
      email: "Follow up on ".html_safe + link_to(content_tag(:b, subject.notification_title_plain(notification)), subject.url, target: "_blank", rel: "noopener"),
    )
  end

  def notification_preview_url(notification:)
    subject.notification_preview_url(notification: notification)
  end

  def notification_preview_is_canvas(notification:)
    subject.notification_preview_is_canvas(notification: notification)
  end

  def notification_body_preview(notification:)
    subject.notification_body_preview(notification: notification)
  end

  def notification_target
    return subject.subject if subject.is_a?(Comment)

    subject
  end

  def notification_subtarget
    subject if subject.is_a?(Comment)
  end

  def summary_blocks
    subject.follow_up_summary_blocks(follow_up_member: organization_membership)
  end

  private

  def enqueue_show_follow_up_job
    ShowFollowUpJob.perform_at(show_at, id)
  end

  def broadcast_follow_ups_stale
    PusherTriggerJob.perform_async(user.channel_name, "follow-ups-stale", nil.to_json)
  end
end
