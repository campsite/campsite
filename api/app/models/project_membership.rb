# frozen_string_literal: true

class ProjectMembership < ApplicationRecord
  include Discard::Model
  include PublicIdGenerator
  include Eventable
  include ActionView::Helpers::UrlHelper

  attr_accessor :event_actor

  acts_as_list scope: [:organization_membership_id, discarded_at: nil], add_new_at: :bottom, top_of_list: 0

  belongs_to :project
  belongs_to :organization_membership, optional: true
  belongs_to :oauth_application, optional: true
  has_one :user, through: :organization_membership

  counter_culture :project,
    column_name: proc { |project_membership|
      next unless project_membership.organization_membership

      project_membership.organization_membership.guest? ? :guests_count : :members_count
    },
    column_names: -> { { ProjectMembership.member => :members_count, ProjectMembership.guest => :guests_count } }

  after_destroy_commit :trigger_project_memberships_stale_event

  delegate :organization, :url, to: :project
  delegate :mrkdwn_link, to: SlackBlockKit

  SERIALIZER_INCLUDES = { project: Project::SERIALIZER_INCLUDES }
  scope :serializer_includes, -> { eager_load(SERIALIZER_INCLUDES) }

  scope :member, -> { joins(:organization_membership).merge(OrganizationMembership.non_guest) }
  scope :guest, -> { joins(:organization_membership).merge(OrganizationMembership.guest) }

  def self.reorder(project_membership_id_position_list, organization_membership)
    ActiveRecord::Base.transaction do
      project_membership_id_position_list.each do |pair|
        project_membership = organization_membership.project_memberships.find_by(public_id: pair[:id])
        project_membership.set_list_position(pair[:position].to_i)
      end
    end
  end

  def api_type_name
    "ProjectMembership"
  end

  def discard_by_actor(actor)
    self.event_actor = actor
    discard
    self.event_actor = nil
  end

  def event_organization
    organization
  end

  def notification_summary(notification:)
    actor = notification.actor.user
    project_display_name = project.private ? "🔒 #{project.name}" : project.name
    url = project.url(organization)

    NotificationSummary.new(
      text: "#{actor.display_name} added you to #{project_display_name}",
      blocks: [
        {
          text: { content: actor.display_name, bold: true },
        },
        {
          text: { content: " added you to " },
        },
        {
          text: { content: project_display_name, bold: true },
        },
      ],
      slack_mrkdwn: "#{actor.display_name} added you to #{mrkdwn_link(url: url, text: project_display_name)}",
      email: link_to(content_tag(:b, actor.display_name), "#{organization.url}/people/#{actor.username}", target: "_blank", rel: "noopener") +
      " added you to " +
      link_to(content_tag(:b, project_display_name), url, target: "_blank", rel: "noopener"),
    )
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
    "View channel"
  end

  def trigger_project_memberships_stale_event
    return unless organization_membership&.user

    PusherTriggerJob.perform_async(organization_membership.user.channel_name, "project-memberships-stale", nil.to_json)
  end
end
