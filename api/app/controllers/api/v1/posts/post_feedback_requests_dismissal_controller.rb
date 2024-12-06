# frozen_string_literal: true

module Api
  module V1
    module Posts
      class PostFeedbackRequestsDismissalController < PostsBaseController
        extend Apigen::Controller

        response model: PostFeedbackRequestSerializer, code: 201
        def create
          # Find possibly discarded and dismissed feedback requests matching the public_id
          feedback = current_post.feedback_requests.find_by!(public_id: params[:feedback_request_id])
          authorize(feedback, :dismiss?)

          feedback.dismiss!

          if feedback.errors.empty?
            render_json(PostFeedbackRequestSerializer, feedback, status: :created)
          else
            render_error(status: :bad_request, message: feedback.errors.full_messages.to_sentence)
          end
        end
      end
    end
  end
end
