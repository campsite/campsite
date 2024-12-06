# frozen_string_literal: true

module Api
  module V1
    module Users
      class NotificationPausesController < V1::BaseController
        skip_before_action :require_authenticated_organization_membership, only: [:create, :destroy]
        after_action :verify_authorized

        rescue_from ArgumentError, with: :render_unprocessable_entity

        extend Apigen::Controller

        response code: 204
        request_params do
          {
            expires_at: { type: :string },
          }
        end
        def create
          authorize(current_user, :pause_notifications?)

          current_user.pause_notifications!(expires_at: Time.iso8601(params[:expires_at]))
        end

        response code: 204
        def destroy
          authorize(current_user, :unpause_notifications?)

          current_user.unpause_notifications!
        end
      end
    end
  end
end
