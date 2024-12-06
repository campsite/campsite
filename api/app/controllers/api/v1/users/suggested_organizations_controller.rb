# frozen_string_literal: true

module Api
  module V1
    module Users
      class SuggestedOrganizationsController < V1::BaseController
        skip_before_action :require_authenticated_organization_membership, only: :index

        extend Apigen::Controller
        response model: SuggestedOrganizationSerializer, code: 200, is_array: true
        def index
          render_json(
            SuggestedOrganizationSerializer,
            # i doubt we ever have multiple orgs with email domain being populated
            # sticking with returning 25 orgs now
            current_user.suggested_organizations.includes(:members, :membership_requests).limit(25),
          )
        end
      end
    end
  end
end
