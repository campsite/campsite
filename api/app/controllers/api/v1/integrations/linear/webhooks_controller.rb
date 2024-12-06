# frozen_string_literal: true

module Api
  module V1
    module Integrations
      module Linear
        class WebhooksController < BaseController
          skip_before_action :require_authenticated_user
          skip_before_action :require_authenticated_organization_membership

          before_action :validate_request

          rescue_from ::LinearEvent::UnsupportedTypeError, with: :render_ok
          rescue_from ::LinearEvent::InvalidOrganizationError, with: :render_ok

          def create
            response = ::LinearEvent.from_payload(payload)&.handle

            render(status: :ok, json: response)
          end

          private

          def payload
            JSON.parse(request.body.read)
          end

          def validate_request
            linear_request = ::LinearEvents::RequestValidator.new(request, params)
            return if linear_request.valid?

            render_error(status: :forbidden, code: :forbidden, message: "invalid request")
          end
        end
      end
    end
  end
end
