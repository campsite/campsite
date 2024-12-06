# frozen_string_literal: true

module Api
  module V1
    module Integrations
      module Hms
        class EventsController < BaseController
          class InvalidPasscodeError < StandardError
            def message
              "unrecognized passcode"
            end
          end

          skip_before_action :require_authenticated_user, only: :create
          skip_before_action :require_authenticated_organization_membership, only: :create
          before_action :ensure_valid_passcode
          rescue_from InvalidPasscodeError, with: :render_unprocessable_entity

          def create
            response = HmsEvent.from_params(params)&.handle

            render(status: :ok, json: response || { ok: true })
          end

          private

          def ensure_valid_passcode
            return if ActiveSupport::SecurityUtils.secure_compare(request.headers["X-Passcode"] || "", Rails.application.credentials.hms.webhook_passcode)

            raise InvalidPasscodeError
          end
        end
      end
    end
  end
end
