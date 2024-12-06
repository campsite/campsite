# frozen_string_literal: true

module Api
  module V1
    module Integrations
      module Google
        class CalendarEventsController < BaseController
          extend Apigen::Controller

          before_action -> { doorkeeper_authorize!(:write_call_room) }, only: :create
          skip_before_action :require_authenticated_organization_membership, only: :create

          response model: GoogleCalendarEventSerializer, code: 201
          def create
            organization = current_user.google_calendar_organization
            call_room = organization.call_rooms.create!(creator: current_user.kept_organization_memberships.find_by(organization: organization), source: "google_calendar")
            CreateHmsCallRoomJob.perform_async(call_room.id)

            render_json(GoogleCalendarEventSerializer, { adminEmail: current_user.email, id: call_room.public_id, videoUri: call_room.url }, status: :created)
          end

          private

          def require_authenticated_user
            return if user_signed_in?

            # Must return 2xx in order for Google to use response to show "login" link.
            # Borrowed from https://developers.google.com/workspace/add-ons/samples/conferencing-sample
            render(json: { error: "AUTH" })
          end
        end
      end
    end
  end
end
