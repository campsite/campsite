# frozen_string_literal: true

module Api
  module V1
    module ProjectMemberships
      class ReordersController < BaseController
        extend Apigen::Controller

        after_action :verify_authorized

        response code: 204
        request_params do
          {
            project_memberships: {
              type: :object,
              is_array: true,
              properties: {
                id: { type: :string },
                position: { type: :number },
              },
            },
          }
        end
        def update
          authorize(current_organization_membership, :reorder?)

          ProjectMembership.reorder(params[:project_memberships], current_organization_membership)
        end
      end
    end
  end
end
