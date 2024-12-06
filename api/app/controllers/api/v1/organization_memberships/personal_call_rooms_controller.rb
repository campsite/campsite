# frozen_string_literal: true

module Api
  module V1
    module OrganizationMemberships
      class PersonalCallRoomsController < BaseController
        extend Apigen::Controller

        around_action :force_database_writing_role, only: [:show]

        after_action :verify_authorized

        response code: 200, model: CallRoomSerializer
        def show
          authorize(current_organization, :create_call_room?)

          call_room = if current_organization_membership.personal_call_room
            current_organization_membership.personal_call_room
          else
            current_organization_membership.create_personal_call_room!(
              creator: current_organization_membership,
              organization: current_organization,
              source: :subject,
            ).tap do |new_room|
              CreateHmsCallRoomJob.perform_async(new_room.id)
            end
          end

          render_json(CallRoomSerializer, call_room)
        end
      end
    end
  end
end
