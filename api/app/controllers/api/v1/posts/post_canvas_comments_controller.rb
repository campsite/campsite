# frozen_string_literal: true

module Api
  module V1
    module Posts
      class PostCanvasCommentsController < PostsBaseController
        skip_before_action :require_authenticated_user, only: :index
        skip_before_action :require_authenticated_organization_membership, only: :index

        extend Apigen::Controller

        response model: CommentSerializer, is_array: true, code: 200
        def index
          authorize(current_post, :list_comments?)

          comments = current_post
            .kept_comments
            .canvas_comments
            .root
            .serializer_preloads

          render_json(CommentSerializer, comments, order: :desc)
        end
      end
    end
  end
end
