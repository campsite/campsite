# frozen_string_literal: true

module Api
  module V1
    class WebPushSubscriptionsController < BaseController
      extend Apigen::Controller

      skip_before_action :require_authenticated_organization_membership, only: [:create]

      response code: 204
      request_params do
        {
          old_endpoint: { type: :string, required: false, nullable: true },
          new_endpoint: { type: :string },
          p256dh: { type: :string },
          auth: { type: :string },
        }
      end
      def create
        subscription = current_user.web_push_subscriptions.find_or_initialize_by(
          endpoint: params[:old_endpoint] || params[:new_endpoint],
        )
        subscription.endpoint = params[:new_endpoint]
        subscription.p256dh = params[:p256dh]
        subscription.auth = params[:auth]
        subscription.save!
      end
    end
  end
end
