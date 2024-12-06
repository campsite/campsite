# frozen_string_literal: true

module Api
  module V1
    module Integrations
      module Google
        class CalendarIntegrationsController < BaseController
          extend Apigen::Controller

          skip_before_action :require_authenticated_organization_membership, only: [:show, :update]

          response model: GoogleCalendarIntegrationSerializer, code: 200
          def show
            render_json(GoogleCalendarIntegrationSerializer, current_user)
          end
        end
      end
    end
  end
end
