# frozen_string_literal: true

class NoteView < ApplicationRecord
  belongs_to :note
  belongs_to :organization_membership

  scope :excluding_member, ->(organization_membership) {
    where.not(organization_membership: organization_membership)
  }
  scope :serializer_preload, -> {
    eager_load(organization_membership: OrganizationMembership::SERIALIZER_EAGER_LOAD)
  }

  after_create_commit :broadcast_views_stale

  private

  def broadcast_views_stale
    payload = { user_id: Current.user&.public_id }
    PusherTriggerJob.perform_async(note.channel_name, "views-stale", payload.to_json)
  end
end
