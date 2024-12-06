# frozen_string_literal: true

module Api
  module V1
    class FollowUpsController < BaseController
      extend Apigen::Controller

      after_action :verify_authorized, except: :index
      after_action :verify_policy_scoped, only: :index

      response model: FollowUpPageSerializer, code: 200
      request_params do
        {
          after: { type: :string, required: false },
          limit: { type: :number, required: false },
        }
      end
      def index
        render_page(
          FollowUpPageSerializer,
          policy_scope(current_organization_membership.unshown_follow_ups.serializer_preload),
          order: { show_at: :asc },
        )
      end

      response model: FollowUpSerializer, code: 200
      request_params do
        {
          show_at: { type: :string, required: true },
        }
      end
      def update
        authorize(current_follow_up, :update?)

        current_follow_up.update!(params.permit(:show_at))

        render_json(FollowUpSerializer, current_follow_up)
      end

      response code: 204
      def destroy
        authorize(current_follow_up, :destroy?)

        current_follow_up.destroy!
      end

      private

      def current_follow_up
        current_organization_membership.follow_ups.find_by!(public_id: params[:id])
      end
    end
  end
end
