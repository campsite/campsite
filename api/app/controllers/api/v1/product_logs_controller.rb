# frozen_string_literal: true

module Api
  module V1
    class ProductLogsController < V1::BaseController
      skip_before_action :require_authenticated_user, only: :create
      skip_before_action :require_authenticated_organization_membership, only: :create

      extend Apigen::Controller

      response code: 201
      request_params do
        {
          events: {
            type: :object,
            is_array: true,
            properties: {
              user_id: { type: :string, required: false },
              org_slug: { type: :string, required: false },
              name: { type: :string },
              data: { type: :object, required: false },
              log_ts: { type: :number, required: false },
              session_id: { type: :string, required: false },
            },
          },
        }
      end
      def create
        params[:events].each_slice(10) do |events|
          ProductLogsJob.perform_async(
            events.as_json,
            request.user_agent,
            { "x-campsite-pwa" => request.headers["x-campsite-pwa"] }.reject { |_, v| v.nil? }.to_json,
          )
        end
        render(json: {}, status: :created)
      end
    end
  end
end
