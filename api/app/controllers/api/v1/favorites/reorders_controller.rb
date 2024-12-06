# frozen_string_literal: true

module Api
  module V1
    module Favorites
      class ReordersController < BaseController
        extend Apigen::Controller

        after_action :verify_authorized, except: :index
        after_action :verify_policy_scoped, only: :index

        response code: 204
        request_params do
          {
            favorites: {
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

          analytics.track(event: "favorites_reordered")

          Favorite.reorder(params[:favorites], current_organization_membership)
        end
      end
    end
  end
end
