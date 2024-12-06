# frozen_string_literal: true

module Api
  module V1
    module Integrations
      module Linear
        class InstallationController < BaseController
          extend Apigen::Controller

          response model: LinearIntegrationSerializer, code: 200, nullable: true
          def show
            authorize(current_organization, :show_linear_integration?)

            if current_organization.linear_integration
              render_json(
                LinearIntegrationSerializer,
                current_organization.linear_integration,
                {
                  current_organization_membership: current_organization_membership,
                },
              )
            else
              render(status: :ok, json: nil)
            end
          end

          response code: 204
          def destroy
            authorize(current_organization, :destroy_linear_integration?)

            current_organization.linear_integration&.destroy!
          end
        end
      end
    end
  end
end
