# frozen_string_literal: true

module Api
  module V1
    class CallRoomsController < BaseController
      extend Apigen::Controller

      skip_before_action :require_authenticated_user, only: :show
      skip_before_action :require_authenticated_organization_membership, only: :show

      before_action :require_organization
      after_action :verify_authorized

      response code: 200, model: CallRoomSerializer
      def show
        authorize(current_call_room, :show?)

        render_json(CallRoomSerializer, current_call_room)
      end

      response code: 201, model: CallRoomSerializer
      request_params do
        {
          source: { type: :string, enum: CallRoom.sources.keys },
        }
      end
      def create
        authorize(current_organization, :create_call_room?)

        call_room = current_organization.call_rooms.create!(creator: current_organization_membership, source: params[:source])
        CreateHmsCallRoomJob.perform_async(call_room.id)

        render_json(CallRoomSerializer, call_room, status: :created)
      end

      private

      def current_call_room
        @current_call_room ||= current_organization.call_rooms.serializer_eager_load.find_by!(public_id: params[:id])
      end
    end
  end
end
