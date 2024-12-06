# frozen_string_literal: true

module Api
  module V1
    module Integrations
      module Linear
        class TeamSyncsController < BaseController
          extend Apigen::Controller

          response code: 204
          def create
            authorize(current_organization, :show_linear_integration?)
            return unless current_organization.linear_integration

            ::Integrations::Linear::SyncTeamsJob.perform_async(current_organization.linear_integration.id)
          end
        end
      end
    end
  end
end
