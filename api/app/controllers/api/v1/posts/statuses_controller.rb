# frozen_string_literal: true

module Api
  module V1
    module Posts
      class StatusesController < PostsBaseController
        extend Apigen::Controller

        after_action :verify_authorized

        request_params do
          {
            status: { type: :string, enum: Post.statuses.keys },
          }
        end
        response code: 204
        def update
          authorize(current_post, :update?)

          current_post.status = params[:status]
          current_post.save!
        rescue ArgumentError => ex
          current_post.errors.add(:base, ex.message)
          render_unprocessable_entity(current_post)
        end
      end
    end
  end
end
