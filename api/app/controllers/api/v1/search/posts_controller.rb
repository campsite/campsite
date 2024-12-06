# frozen_string_literal: true

module Api
  module V1
    module Search
      class PostsController < BaseController
        extend Apigen::Controller

        after_action :verify_authorized
        after_action :verify_policy_scoped, only: :index

        response model: PostSerializer, is_array: true, code: 200
        request_params do
          {
            q: { type: :string },
            project_id: { type: :string, required: false },
            author: { type: :string, required: false },
            tag: { type: :string, required: false },
            limit: { type: :number, required: false },
          }
        end
        def index
          authorize(current_organization, :list_posts?)

          query = params[:q] || ""
          results = Post.scoped_search(
            query: query,
            sort_by_date: query.blank?,
            organization: current_organization,
            limit: params[:limit] || 10,
            project_public_id: params[:project_id],
            author_username: params[:author],
            tag_name: params[:tag],
          )

          render_json(PostSerializer, policy_scope(Post.in_order_of(:id, results.pluck(:id)).includes(Post::FEED_INCLUDES)))
        end
      end
    end
  end
end
