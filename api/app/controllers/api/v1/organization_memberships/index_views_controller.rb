# frozen_string_literal: true

module Api
  module V1
    module OrganizationMemberships
      class IndexViewsController < BaseController
        extend Apigen::Controller

        response model: PublicOrganizationMembershipSerializer, code: 200
        request_params do
          {
            last_viewed_posts_at: { type: :string },
          }
        end
        def update
          authorize(current_organization_membership, :set_last_viewed_posts_at?)

          current_organization_membership.update!(params.permit(:last_viewed_posts_at))

          render_json(PublicOrganizationMembershipSerializer, current_organization_membership)
        end
      end
    end
  end
end
