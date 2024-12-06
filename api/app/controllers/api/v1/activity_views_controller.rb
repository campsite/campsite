# frozen_string_literal: true

module Api
  module V1
    class ActivityViewsController < BaseController
      extend Apigen::Controller

      response model: UserNotificationCountsSerializer, code: 200
      request_params do
        {
          last_seen_at: { type: :string, required: true },
        }
      end
      def create
        if params[:last_seen_at].blank?
          return render_error(status: :unprocessable_entity, code: "unprocessable", message: "Last seen at is required.")
        end

        current_organization_membership.update!(activity_last_seen_at: params[:last_seen_at])
        render_json(UserNotificationCountsSerializer, current_user)
      end
    end
  end
end
