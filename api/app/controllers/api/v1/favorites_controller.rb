# frozen_string_literal: true

module Api
  module V1
    class FavoritesController < BaseController
      extend Apigen::Controller

      after_action :verify_authorized, except: :index
      after_action :verify_policy_scoped, only: :index

      response model: FavoriteSerializer, is_array: true, code: 200
      def index
        authorize(current_organization_membership, :show?)

        render_json(
          FavoriteSerializer,
          policy_scope(current_organization_membership.member_favorites)
            .preload(
              favoritable: MessageThread::SERIALIZER_INCLUDES + Project::SERIALIZER_INCLUDES + OrganizationMembership::SERIALIZER_EAGER_LOAD,
            ),
        )
      end

      response code: 204
      def destroy
        authorize(current_organization_membership, :show?)

        current_organization_membership.member_favorites.find_by(public_id: params[:id])&.destroy!
      end
    end
  end
end
