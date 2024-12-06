# frozen_string_literal: true

module Api
  module V1
    module CallRooms
      class InvitationsController < BaseController
        extend Apigen::Controller

        after_action :verify_authorized

        response code: 201
        request_params do
          {
            member_ids: { type: :string, is_array: true },
          }
        end
        def create
          authorize(current_call_room, :create_invitation?)

          current_call_room.invitations.create!(
            creator_organization_membership: current_organization_membership,
            invitee_organization_membership_ids: current_organization.kept_memberships.eager_load(:user, :active_call_peers).where(public_id: params[:member_ids]).pluck(:id),
          ).notify_invitees

          render_created
        end

        private

        def current_call_room
          @current_call_room ||= current_organization.call_rooms.eager_load(active_peers: { organization_membership: OrganizationMembership::SERIALIZER_EAGER_LOAD }).find_by!(public_id: params[:call_room_id])
        end
      end
    end
  end
end
