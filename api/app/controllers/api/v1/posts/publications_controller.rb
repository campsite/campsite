# frozen_string_literal: true

module Api
  module V1
    module Posts
      class PublicationsController < BaseController
        extend Apigen::Controller

        after_action :verify_authorized

        rescue_from Workflow::NoTransitionAllowed, with: :render_unprocessable_entity

        response model: PostSerializer, code: 201
        def create
          authorize(current_post, :publish?)

          current_post.publish!

          render_json(PostSerializer, current_post, status: :created)
        end

        private

        def current_post
          @current_post ||= current_organization.kept_posts.feed_includes.find_by!(public_id: params[:post_id])
        end
      end
    end
  end
end
