# frozen_string_literal: true

module Api
  module V1
    module MessageThreads
      class FavoritesController < BaseController
        extend Apigen::Controller

        response model: FavoriteSerializer, code: 201
        def create
          authorize(current_message_thread, :create_favorite?)

          favorite = current_message_thread.favorites.create!(organization_membership: current_organization_membership)

          analytics.track(event: "favorite_added", properties: { subject_type: "message_thread", subject_id: current_message_thread.id })

          render_json(FavoriteSerializer, favorite, status: :created)
        end

        response code: 204
        def destroy
          authorize(current_message_thread, :remove_favorite?)

          analytics.track(event: "favorite_removed", properties: { subject_type: "message_thread", subject_id: current_message_thread.id })

          current_message_thread.favorites.find_by(organization_membership: current_organization_membership)&.destroy!
        end

        private

        def current_message_thread
          @current_message_thread ||= current_organization_membership
            .message_threads
            .find_by!(public_id: params[:thread_id])
        end
      end
    end
  end
end
