# frozen_string_literal: true

module Api
  module V1
    module Organizations
      class FeaturesController < V1::BaseController
        extend Apigen::Controller

        skip_before_action :require_authenticated_user, only: :index
        skip_before_action :require_authenticated_organization_membership, only: :index
        skip_before_action :require_org_two_factor_authentication, only: :index

        response code: 200 do
          { features: { type: :string, is_array: true, enum: (Organization::FEATURE_FLAGS + Plan::FEATURES).uniq } }
        end
        def index
          raise ActiveRecord::RecordNotFound unless current_organization

          render(json: { features: current_organization.features }, status: :ok)
        end
      end
    end
  end
end
