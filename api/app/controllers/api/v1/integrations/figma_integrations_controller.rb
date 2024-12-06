# frozen_string_literal: true

module Api
  module V1
    module Integrations
      class FigmaIntegrationsController < BaseController
        extend Apigen::Controller

        after_action :verify_authorized
        skip_before_action :require_authenticated_organization_membership, only: [:show]

        response code: 200 do
          { has_figma_integration: { type: :boolean } }
        end
        def show
          authorize(current_user, :show_figma_integration?)

          render(json: { has_figma_integration: !!current_user.figma_integration }, status: :ok)
        end
      end
    end
  end
end
