# frozen_string_literal: true

module Api
  module V1
    module Posts
      class TasksController < PostsBaseController
        extend Apigen::Controller

        response model: PostSerializer, code: 200
        request_params do
          {
            index: { type: :number },
            checked: { type: :boolean },
          }
        end
        def update
          authorize(current_post, :update_tasks?)

          current_post.update_task(index: params[:index], checked: params[:checked])

          render_json(PostSerializer, current_post)
        end
      end
    end
  end
end
