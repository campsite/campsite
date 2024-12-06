# frozen_string_literal: true

class ProjectPin < ApplicationRecord
  include Discard::Model
  include PublicIdGenerator
  include Eventable

  belongs_to :subject, polymorphic: true
  belongs_to :project
  belongs_to :pinner, class_name: "OrganizationMembership", foreign_key: "organization_membership_id"

  acts_as_list scope: :project, add_new_at: :bottom, top_of_list: 0

  delegate :organization, to: :subject

  def post
    subject if subject.is_a?(Post)
  end

  def note
    subject if subject.is_a?(Note)
  end

  def call
    subject if subject.is_a?(Call)
  end

  def event_actor
    @event_actor || pinner
  end

  def event_organization
    organization
  end

  def discard_by_actor(actor)
    @event_actor = actor
    discard
    @event_actor = nil
  end
end
