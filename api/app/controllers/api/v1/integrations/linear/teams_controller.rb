# frozen_string_literal: true

module Api
  module V1
    module Integrations
      module Linear
        class TeamsController < BaseController
          extend Apigen::Controller

          before_action :require_linear_integration

          response model: IntegrationTeamSerializer, is_array: true, code: 200
          def index
            authorize(current_organization, :show_linear_integration?)

            render_json(
              IntegrationTeamSerializer,
              current_linear_integration.teams.not_private.order(created_at: :desc),
            )
          end

          private

          def current_linear_integration
            @current_linear_integration ||= current_organization.linear_integration
          end
        end
      end
    end
  end
end
