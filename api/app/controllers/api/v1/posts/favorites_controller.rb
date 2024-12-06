# frozen_string_literal: true

module Api
  module V1
    module Posts
      class FavoritesController < PostsBaseController
        extend Apigen::Controller

        after_action :verify_authorized

        response model: FavoriteSerializer, code: 201
        def create
          authorize(current_post, :create_favorite?)

          favorite = current_post.favorites.create!(organization_membership: current_organization_membership)

          analytics.track(event: "favorite_added", properties: { subject_type: "post", subject_id: current_post.id })

          render_json(FavoriteSerializer, favorite, status: :created)
        end

        response code: 204
        def destroy
          authorize(current_post, :remove_favorite?)

          analytics.track(event: "favorite_removed", properties: { subject_type: "post", subject_id: current_post.id })

          current_post.favorites.find_by(organization_membership: current_organization_membership)&.destroy!
        end
      end
    end
  end
end
