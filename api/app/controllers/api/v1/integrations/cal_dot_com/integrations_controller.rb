# frozen_string_literal: true

module Api
  module V1
    module Integrations
      module CalDotCom
        class IntegrationsController < BaseController
          extend Apigen::Controller

          skip_before_action :require_authenticated_organization_membership, only: [:show]

          response model: CalDotComIntegrationSerializer, code: 200
          def show
            render_json(CalDotComIntegrationSerializer, current_user)
          end
        end
      end
    end
  end
end
