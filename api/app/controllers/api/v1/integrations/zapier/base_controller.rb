# frozen_string_literal: true

module Api
  module V1
    module Integrations
      module Zapier
        class BaseController < ActionController::API
          include RequestRescuable
          include RequestReturnable

          before_action :authenticate

          private

          def authenticate
            head(:unauthorized) unless valid_integration? || valid_doorkeeper_token?
          end

          def valid_integration?
            token.present? && integration&.valid?
          end

          def token
            @token ||= request.headers["x-campsite-zapier-token"]
          end

          def integration
            @integration ||= Integration.zapier.find_by(token: token)
          end

          def current_oauth_application
            @oauth_application ||= doorkeeper_token&.application
          end

          def current_organization
            @current_organization ||= if token.present? && integration.owner_type == "Organization"
              integration.owner
            elsif doorkeeper_token
              Organization.find_by(id: doorkeeper_token.resource_owner_id)
            end
          end
        end
      end
    end
  end
end
