# frozen_string_literal: true

class PostFeedbackRequest < ApplicationRecord
  include Discard::Model
  include PublicIdGenerator
  include Eventable
  include ActionView::Helpers::UrlHelper

  belongs_to :post
  belongs_to :member, class_name: "OrganizationMembership", foreign_key: "organization_membership_id"

  delegate :user, to: :member
  delegate :url, :notification_body_slack_blocks, to: :post
  delegate :mrkdwn_link, to: SlackBlockKit

  validate :ensure_one_kept_request, on: :create

  scope :kept_and_not_dismissed, -> { kept.where(dismissed_at: nil) }

  def ensure_one_kept_request
    return if PostFeedbackRequest.where(post: post, member: member, discarded_at: nil).empty?

    errors.add(:base, "Only one feedback request per post and user is allowed")
  end

  def api_type_name
    "PostFeedbackRequest"
  end

  def self.discard_all_by_actor(actor)
    @event_actor = actor
    discard_all
    @event_actor = nil
  end

  def event_actor
    @event_actor || post.member
  end

  def event_organization
    post.organization
  end

  def notification_summary(notification:)
    actor = notification.actor
    organization = notification.organization

    NotificationSummary.new(
      text: "#{actor.display_name} requested your feedback",
      blocks: [
        {
          text: { content: actor.display_name, bold: true },
        },
        {
          text: { content: " requested your feedback" },
        },
      ],
      slack_mrkdwn: "#{actor.display_name} requested your feedback",
      email: link_to(content_tag(:b, actor.display_name), "#{organization.url}/people/#{actor.username}", target: "_blank", rel: "noopener") + " requested your feedback",
    )
  end

  def notification_body_preview(notification:)
    post.trimmed_body_preview
  end

  def notification_preview_url(notification:)
    post.sorted_attachments.first&.thumbnail_url
  end

  def notification_preview_is_canvas(notification:)
    false
  end

  def dismiss!
    update!(dismissed_at: Time.current)
  end

  def dismissed?
    !!dismissed_at
  end
end
