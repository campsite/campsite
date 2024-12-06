# frozen_string_literal: true

class CallRoomInvitation < ApplicationRecord
  include Discard::Model

  belongs_to :room, class_name: "CallRoom", foreign_key: "call_room_id", inverse_of: :invitations
  belongs_to :creator_organization_membership, class_name: "OrganizationMembership"
  has_one :organization, through: :room

  delegate :url, :active_peers, to: :room

  after_discard :trigger_destroyed_event

  def notify_invitees
    invitee_organization_memberships.each do |invitee_organization_membership|
      next if invitee_organization_membership.on_call?

      invitee_organization_membership.user.web_push_subscriptions.each do |web_push_subscription|
        DeliverWebPushCallRoomInvitationJob.perform_async(room.id, creator_organization_membership.id, web_push_subscription.id)
      end

      PusherTriggerJob.perform_async(
        invitee_organization_membership.user.channel_name,
        "incoming-call-room-invitation",
        {
          call_room_id: room.public_id,
          call_room_url: url,
          creator_member: OrganizationMemberSerializer.render_as_hash(creator_organization_membership),
          other_active_peers: active_peers
            .where(organization_membership: nil)
            .or(active_peers.where.not(organization_membership: creator_organization_membership))
            .map { |call_peer| CallPeerSerializer.render_as_hash(call_peer) },
          skip_push: invitee_organization_membership.user.notifications_paused?,
        }.to_json,
      )
    end
  end

  def invitee_organization_memberships
    @invitee_organization_memberships ||= organization.memberships.where(id: invitee_organization_membership_ids)
  end

  private

  def trigger_destroyed_event
    invitee_organization_memberships.each do |invitee_organization_membership|
      PusherTriggerJob.perform_async(
        invitee_organization_membership.user.channel_name,
        "call-room-invitation-destroyed",
        {
          call_room_id: room.public_id,
        }.to_json,
      )
    end
  end
end
