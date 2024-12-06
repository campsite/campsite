# frozen_string_literal: true

module Api
  module V2
    module Posts
      class ResolutionsController < BaseController
        extend Apigen::Controller

        include MarkdownEnrichable

        after_action :verify_authorized

        api_summary "Resolve post"
        api_description <<~DESC
          Resolves a post with an optional message or resolving comment.
        DESC
        response model: V2PostSerializer, code: 201
        request_params do
          {
            content_markdown: { type: :string, nullable: true },
            comment_id: { type: :string, nullable: true },
          }
        end
        def create
          authorize(current_post, :resolve?)

          current_post.resolve!(
            actor: current_api_actor,
            html: markdown_to_html(params[:content_markdown]),
            comment_id: params[:comment_id],
          )

          render_json(V2PostSerializer, current_post, status: :created)
        end

        api_summary "Unresolve post"
        api_description <<~DESC
          Unresolves a post.
        DESC
        response model: V2PostSerializer, code: 200
        def destroy
          authorize(current_post, :resolve?)

          current_post.unresolve!(actor: current_api_actor)

          render_json(V2PostSerializer, current_post)
        end

        private

        def current_post
          @current_post ||= current_organization
            .kept_published_posts
            .public_api_includes
            .find_by!(public_id: params[:post_id])
        end
      end
    end
  end
end
