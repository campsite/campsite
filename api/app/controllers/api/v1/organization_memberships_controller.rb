# frozen_string_literal: true

module Api
  module V1
    class OrganizationMembershipsController < BaseController
      skip_before_action :require_authenticated_organization_membership, only: [:index]

      extend Apigen::Controller

      response model: PublicOrganizationMembershipSerializer, is_array: true, code: 200
      def index
        render_json(
          PublicOrganizationMembershipSerializer,
          current_user.kept_organization_memberships
            .eager_load(organization: :admins)
            .order(position: :asc, id: :asc),
        )
      end
    end
  end
end
