# frozen_string_literal: true

module Api
  module V1
    module Comments
      class TasksController < BaseController
        extend Apigen::Controller

        response model: CommentSerializer, code: 200
        request_params do
          {
            index: { type: :number },
            checked: { type: :boolean },
          }
        end
        def update
          authorize(current_comment, :update_tasks?)

          current_comment.update_task(index: params[:index], checked: params[:checked])

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
