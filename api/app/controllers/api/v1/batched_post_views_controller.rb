# frozen_string_literal: true

module Api
  module V1
    class BatchedPostViewsController < BaseController
      extend Apigen::Controller

      skip_before_action :require_authenticated_user, only: :create
      skip_before_action :require_authenticated_organization_membership, only: :create

      VIEW_REQUEST_PARAMS = {
        type: :object,
        is_array: true,
        properties: {
          # allows for non-member views
          member_id: { type: :string, required: false, nullable: true },
          post_id: { type: :string },
          log_ts: { type: :number },
          read: { type: :boolean },
          dwell_time: { type: :integer },
        },
      }.freeze

      response code: 204
      request_params do
        {
          views: VIEW_REQUEST_PARAMS,
        }
      end
      def create
        params[:views].each_slice(20) do |views|
          PostViewsJob.perform_async(
            views.as_json,
            current_user&.id,
            client_ip,
            request.user_agent,
          )
        end
      end
    end
  end
end
