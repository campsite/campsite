# frozen_string_literal: true

module Api
  module V2
    class MembersController < BaseController
      extend Apigen::Controller

      api_summary "List members"
      api_description <<~DESC
        Lists all members of the organization.
      DESC
      response model: V2OrganizationMemberPageSerializer, code: 200
      request_params do
        {
          q: { type: :string, required: false, description: "Search by name or email." },
          after: { type: :string, required: false, description: "Use with `next_cursor` and `prev_cursor` in the response to paginate through results." },
          limit: { type: :number, required: false, description: "Specifies how many records to return. The default and maximum is 50." },
          roles: { type: :string, enum: Role::NAMES, required: false, description: "Filter by role. Separate multiple roles with commas." },
          **v2_order_schema(by: OrganizationMembership::PUBLIC_API_ALLOWED_ORDER_FIELDS),
        }
      end
      def index
        authorize(current_organization, :list_members?)

        members = current_organization.kept_memberships.serializer_eager_load

        if roles_filter
          members = members.where(role_name: roles_filter)
        end

        if params[:q]
          members = members.search_by(params[:q])
        end

        render_page(
          V2OrganizationMemberPageSerializer,
          policy_scope(members),
          order: order_params(default: { created_at: :asc }),
        )
      end

      private

      def roles_filter
        return unless params[:roles]

        params[:roles].to_s.split(",")
      end

      def allowed_order_fields
        OrganizationMembership::PUBLIC_API_ALLOWED_ORDER_FIELDS
      end
    end
  end
end
