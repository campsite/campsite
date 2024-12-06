# frozen_string_literal: true

module Api
  module V1
    module Posts
      class ResolutionsController < PostsBaseController
        extend Apigen::Controller

        after_action :verify_authorized

        response model: PostSerializer, code: 201
        request_params do
          {
            resolve_html: { type: :string, nullable: true },
            comment_id: { type: :string, nullable: true },
          }
        end
        def create
          authorize(current_post, :resolve?)

          current_post.resolve!(actor: current_organization_membership, html: params[:resolve_html], comment_id: params[:comment_id])

          render_json(PostSerializer, current_post, status: :created)
        end

        response model: PostSerializer, code: 200
        def destroy
          authorize(current_post, :resolve?)

          current_post.unresolve!(actor: current_organization_membership)

          render_json(PostSerializer, current_post)
        end
      end
    end
  end
end
