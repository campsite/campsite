# frozen_string_literal: true

module Api
  module V1
    module Integrations
      module Google
        class CalendarEventsOrganizationsController < BaseController
          extend Apigen::Controller

          skip_before_action :require_authenticated_organization_membership, only: [:show, :update]

          response code: 204
          request_params do
            {
              organization_id: { type: :string },
            }
          end
          def update
            current_user.update!(google_calendar_organization_id: current_user.organizations.find_by!(public_id: params[:organization_id]).id)
          end
        end
      end
    end
  end
end
