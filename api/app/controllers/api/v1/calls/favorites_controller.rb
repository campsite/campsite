# frozen_string_literal: true

module Api
  module V1
    module Calls
      class FavoritesController < BaseController
        extend Apigen::Controller

        after_action :verify_authorized

        response model: FavoriteSerializer, code: 201
        def create
          authorize(current_call, :create_favorite?)

          favorite = current_call.favorites.create!(organization_membership: current_organization_membership)

          analytics.track(event: "favorite_added", properties: { subject_type: "call", subject_id: current_call.id })

          render_json(FavoriteSerializer, favorite, status: :created)
        end

        response code: 204
        def destroy
          authorize(current_call, :remove_favorite?)

          analytics.track(event: "favorite_removed", properties: { subject_type: "call", subject_id: current_call.id })

          current_call.favorites.find_by(organization_membership: current_organization_membership)&.destroy!
        end

        private

        def current_call
          @current_call ||= Call.serializer_preload.find_by!(public_id: params[:call_id])
        end
      end
    end
  end
end
