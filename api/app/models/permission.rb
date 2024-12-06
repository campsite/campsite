# frozen_string_literal: true

class Permission < ApplicationRecord
  include Discard::Model
  include PublicIdGenerator
  include Eventable
  include ActionView::Helpers::UrlHelper

  belongs_to :user
  belongs_to :subject, polymorphic: true

  enum :action, { view: 0, edit: 1 }

  attr_accessor :event_actor

  delegate :mrkdwn_section_block, :mrkdwn_link, to: SlackBlockKit
  delegate :url, to: :subject

  def discard_by_actor(actor)
    self.event_actor = actor
    discard
    self.event_actor = nil
  end

  def event_organization
    subject.organization
  end

  def api_type_name
    "Permission"
  end

  def notification_summary(notification:)
    actor = notification.actor.user
    organization = notification.organization

    case subject
    when Project
      url = subject.url(organization)
      return NotificationSummary.new(
        text: "#{actor.display_name} added you to 🔒 #{subject.name}",
        blocks: [
          {
            text: { content: actor.display_name, bold: true },
          },
          {
            text: { content: " added you to " },
          },
          {
            text: { content: "🔒 #{subject.name}", bold: true },
          },
        ],
        slack_mrkdwn: "#{actor.display_name} added you to #{mrkdwn_link(url: url, text: "🔒 #{subject.name}")}",
        email: link_to(content_tag(:b, actor.display_name), "#{organization.url}/people/#{actor.username}", target: "_blank", rel: "noopener") +
        " added you to " +
        link_to(content_tag(:b, "🔒 #{subject.name}"), url, target: "_blank", rel: "noopener"),
      )
    when Note
      url = subject.url(organization)
      title = subject.title || "Untitled"
      return NotificationSummary.new(
        text: "#{actor.display_name} shared #{title} with you",
        blocks: [
          {
            text: { content: actor.display_name, bold: true },
          },
          {
            text: { content: " shared " },
          },
          {
            text: { content: title, bold: true },
          },
          {
            text: { content: " with you" },
          },
        ],
        slack_mrkdwn: "#{actor.display_name} shared #{mrkdwn_link(url: url, text: subject.title)} with you",
        email: link_to(content_tag(:b, actor.display_name), "#{organization.url}/people/#{actor.username}", target: "_blank", rel: "noopener") +
        " shared " +
        link_to(content_tag(:b, title), url, target: "_blank", rel: "noopener") +
        " with you",
      )
    end

    raise "Couldn't create summary for Permission #{id}"
  end

  def notification_preview_url(notification:)
    nil
  end

  def notification_body_preview(notification:)
    nil
  end

  def notification_preview_is_canvas(notification:)
    false
  end

  def notification_cta_button_text
    case subject
    when Project
      return "View channel"
    when Note
      return "View note"
    end

    raise "Couldn't create CTA button text for Permission #{id}"
  end
end
