# frozen_string_literal: true

module Api
  module V1
    module Posts
      class PostFeedbackRequestsController < PostsBaseController
        extend Apigen::Controller

        response model: PostFeedbackRequestSerializer, code: 201
        request_params do
          {
            member_id: { type: :string },
          }
        end
        def create
          authorize(current_post, :create_feedback_request?)

          member = current_organization.kept_memberships.find_by(public_id: params[:member_id])
          feedback = current_post.feedback_requests.find_or_create_by(member: member)

          feedback.update!(dismissed_at: nil) if feedback.dismissed?
          feedback.undiscard if feedback.discarded?

          if feedback.errors.empty?
            render_json(PostFeedbackRequestSerializer, feedback, status: :created)
          else
            render_error(status: :bad_request, message: feedback.errors.full_messages.to_sentence)
          end
        end

        response code: 204
        def destroy
          feedback = current_post.kept_feedback_requests.find_by!(public_id: params[:id])
          authorize(feedback, :destroy?)

          feedback.discard
        end
      end
    end
  end
end
