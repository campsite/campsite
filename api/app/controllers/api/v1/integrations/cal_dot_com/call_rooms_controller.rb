# frozen_string_literal: true

module Api
  module V1
    module Integrations
      module CalDotCom
        class CallRoomsController < BaseController
          extend Apigen::Controller

          before_action -> { doorkeeper_authorize!(:write_call_room) }, only: :create
          skip_before_action :require_authenticated_organization_membership, only: :create

          response model: CallRoomSerializer, code: 201
          def create
            organization = current_user.cal_dot_com_organization
            call_room = organization.call_rooms.create!(creator: current_user.kept_organization_memberships.find_by(organization: organization), source: "cal_dot_com")
            CreateHmsCallRoomJob.perform_async(call_room.id)

            render_json(CallRoomSerializer, call_room, status: :created)
          end
        end
      end
    end
  end
end
