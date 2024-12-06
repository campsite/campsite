# frozen_string_literal: true

module Api
  module V2
    class ProjectsController < BaseController
      extend Apigen::Controller

      api_summary "List channels"
      api_description <<~DESC
        Lists all channels in your organization.
      DESC
      response model: V2ProjectPageSerializer, code: 200
      request_params do
        {
          name: {
            type: :string,
            required: false,
            description: "When included, filters channels by name.",
          },
          after: {
            type: :string,
            required: false,
            description: "Use with `next_cursor` and `prev_cursor` in the response to paginate through results.",
          },
          limit: {
            type: :number,
            required: false,
            description: "Specifies how many records to return. The default and maximum is 50.",
          },
          **v2_order_schema(by: Project::PUBLIC_API_ALLOWED_ORDER_FIELDS),
        }
      end
      def index
        authorize(current_organization, :list_projects?)

        projects = policy_scope(current_organization.projects.not_archived)

        if params[:name].present?
          projects = projects.search_by(params[:name])
        end

        render_page(
          V2ProjectPageSerializer,
          projects.serializer_includes,
          order: order_params(default: { created_at: :asc }),
        )
      end

      private

      def allowed_order_fields
        Project::PUBLIC_API_ALLOWED_ORDER_FIELDS
      end
    end
  end
end
