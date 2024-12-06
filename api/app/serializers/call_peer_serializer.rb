# frozen_string_literal: true

class CallPeerSerializer < ApiSerializer
  api_association :member, blueprint: OrganizationMemberSerializer do |peer|
    peer.organization_membership || OrganizationMembership::NullOrganizationMembership.new(user: peer.user, display_name: peer.name)
  end
  api_field :active?, name: :active, type: :boolean
  api_field :remote_peer_id
end
