# frozen_string_literal: true

class Reaction < ApplicationRecord
  include PublicIdGenerator
  include Discard::Model
  include Eventable

  belongs_to :member, class_name: "OrganizationMembership", foreign_key: :organization_membership_id
  belongs_to :custom_content, class_name: "CustomReaction", foreign_key: :custom_reaction_id, optional: true
  belongs_to :subject, polymorphic: true

  validates :content, presence: false, length: { maximum: 24, too_long: "should be less than 24 characters" }
  validates :member, uniqueness: { scope: [:subject_id, :subject_type, :content, :custom_content, :discarded_at], message: "has already reacted with this emoji" }
  validate :either_content_or_custom_content_must_be_present

  after_commit :broadcast_reactions_stale

  delegate :user, to: :member
  delegate :url, to: :subject
  delegate :mrkdwn_link, to: SlackBlockKit

  def self.discard_all_by_actor(actor)
    @event_actor = actor
    discard_all
    @event_actor = nil
  end

  def api_type_name
    "Reaction"
  end

  def event_actor
    @event_actor || member
  end

  def event_organization
    member.organization
  end

  def notification_member
    case subject
    when Post, Comment
      subject.member
    end
  end

  def notification_target
    case subject
    when Post
      subject
    when Comment
      subject.subject
    else
      raise "Couldn't create notification target for Reaction #{id}"
    end
  end

  def notification_subtarget
    subject if subject.is_a?(Comment)
  end

  def notification_summary(notification:)
    actor = notification.actor
    organization = notification.organization
    reaction_text_content = content || ":#{custom_content&.name}:"

    case subject
    when Post
      return NotificationSummary.new(
        text: "#{actor.display_name} reacted #{reaction_text_content} to your post",
        blocks: [
          {
            text: { content: actor.display_name, bold: true },
          },
          {
            text: { content: " reacted " },
          },
          {
            text: { content: " to " },
          },
          subject.notification_title_block(notification),
        ],
        slack_mrkdwn: "#{actor.display_name} reacted #{reaction_text_content} to your post #{mrkdwn_link(url: subject.url(organization), text: subject.notification_title_plain(notification))}",
        email: "",
      )
    when Comment
      case subject.subject
      when Post, Note
        what = subject.reply? ? "reply" : "comment"

        return NotificationSummary.new(
          text: "#{actor.display_name} reacted #{reaction_text_content} to your #{what}",
          blocks: [
            {
              text: { content: actor.display_name, bold: true },
            },
            {
              text: { content: " reacted " },
            },
            {
              text: { content: " to your #{what}" },
            },
          ],
          slack_mrkdwn: "#{actor.display_name} reacted #{reaction_text_content} to your #{what}",
          email: "",
        )
      end
    end

    raise "Couldn't create notification summary for Reaction #{id}"
  end

  def notification_reply_to_body_preview(notification:)
    subject.notification_body_preview(notification: notification)
  end

  def notification_body_preview(notification:)
    nil
  end

  def notification_preview_url(notification:)
    case subject
    when Post
      subject.sorted_attachments.first&.thumbnail_url
    when Comment
      nil
    end
  end

  def notification_preview_is_canvas(notification:)
    false
  end

  def broadcast_reactions_stale
    return unless subject && member

    post = if subject.is_a?(Post)
      subject
    elsif subject.is_a?(Comment) && subject.subject.is_a?(Post)
      subject.subject
    end

    if post
      PusherTriggerJob.perform_async(post.channel_name, "reactions-stale", { post_id: post.public_id, subject_type: subject_type, user_id: user.public_id }.to_json)
    end
  end

  private

  def either_content_or_custom_content_must_be_present
    if content.nil? && custom_content.nil?
      errors.add(:base, "Either content or custom_content must be present, both cannot be nil at the same time.")
    elsif content.present? && custom_content.present?
      errors.add(:base, "Either content or custom_content must be present, both cannot be present at the same time.")
    end
  end
end
