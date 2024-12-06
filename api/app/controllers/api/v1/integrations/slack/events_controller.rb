# frozen_string_literal: true

module Api
  module V1
    module Integrations
      module Slack
        class EventsController < BaseController
          skip_before_action :require_authenticated_user, only: :create
          skip_before_action :require_authenticated_organization_membership, only: :create
          before_action :validate_request, only: :create
          rescue_from SlackEvent::UnrecognizedTypeError, with: :render_unprocessable_entity

          include SlackEventRequestValidatable

          def create
            response = SlackEvent.from_params(params).handle
            render(status: :ok, json: response)
          end
        end
      end
    end
  end
end
