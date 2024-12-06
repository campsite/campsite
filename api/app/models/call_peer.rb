# frozen_string_literal: true

class CallPeer < ApplicationRecord
  belongs_to :call, inverse_of: :peers
  belongs_to :organization_membership, optional: true
  belongs_to :user, optional: true

  delegate :trigger_current_user_stale, to: :organization_membership, allow_nil: true

  scope :active, -> { where(left_at: nil) }

  def self.create_or_find_by_hms_event!(event)
    call = Call.create_or_find_by_hms_event!(event)
    user = User.find_by(public_id: event.user_id)
    organization_membership = call.room.organization.kept_memberships.find_by(user: user)

    create_or_find_by!(remote_peer_id: event.peer_id) do |call_peer|
      call_peer.call = call
      call_peer.user = user
      call_peer.organization_membership = organization_membership
      call_peer.name = event.user_name
      call_peer.joined_at = event.joined_at
    end
  end

  def active?
    !left_at
  end

  def export_json
    {
      organization_membership_id: organization_membership&.public_id,
      name: name,
    }
  end
end
