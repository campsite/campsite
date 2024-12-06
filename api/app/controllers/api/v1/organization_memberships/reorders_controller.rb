# frozen_string_literal: true

module Api
  module V1
    module OrganizationMemberships
      class ReordersController < BaseController
        skip_before_action :require_authenticated_organization_membership, only: [:update]

        extend Apigen::Controller

        response code: 204
        request_params do
          {
            membership_ids: {
              type: :string,
              is_array: true,
            },
          }
        end
        def update
          authorize(current_user, :reorder_memberships?)

          analytics.track(event: "orgs_reordered")

          OrganizationMembership.reorder(
            public_ids: params[:membership_ids],
            user: current_user,
          )
        end
      end
    end
  end
end
