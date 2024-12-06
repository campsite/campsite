# frozen_string_literal: true

module Api
  module V1
    module Posts
      class SeoInfosController < BaseController
        extend Apigen::Controller

        skip_before_action :require_authenticated_user, only: :show
        skip_before_action :require_authenticated_organization_membership, only: :show

        after_action :verify_authorized

        response model: PostSeoInfoSerializer, code: 200
        def show
          authorize(current_post, :show?)
          render_json(PostSeoInfoSerializer, current_post)
        end

        private

        def current_post
          raise ActiveRecord::RecordNotFound unless current_organization

          @current_post ||= current_organization
            .kept_published_posts
            .with_published_state
            .eager_load(:attachments, :project, member: OrganizationMembership::SERIALIZER_EAGER_LOAD)
            .find_by!(public_id: params[:post_id])
        end
      end
    end
  end
end
