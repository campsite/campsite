# frozen_string_literal: true

module Api
  module V1
    module Comments
      class ResolutionsController < BaseController
        extend Apigen::Controller

        response model: CommentSerializer, code: 200
        def create
          authorize(current_comment, :resolve?)
          current_comment.resolve!(actor: current_organization_membership)
          render_json(CommentSerializer, current_comment)
        end

        response model: CommentSerializer, code: 200
        def destroy
          authorize(current_comment, :resolve?)
          current_comment.unresolve!(actor: current_organization_membership)
          render_json(CommentSerializer, current_comment)
        end

        private

        def current_comment
          @current_comment ||= Comment.serializer_preloads.kept.find_by!(public_id: params[:comment_id])
        end
      end
    end
  end
end
