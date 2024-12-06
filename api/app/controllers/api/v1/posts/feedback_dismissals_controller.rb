# frozen_string_literal: true

module Api
  module V1
    module Posts
      class FeedbackDismissalsController < PostsBaseController
        extend Apigen::Controller

        response model: PostFeedbackRequestSerializer, code: 201
        def create
          authorize(current_post, :show?)
          if (feedback = current_post.feedback_requests.find_by(organization_membership_id: current_organization_membership.id))
            feedback.dismiss!
          else
            feedback = current_post.feedback_requests.create(dismissed_at: Time.current, member: current_organization_membership)
          end

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
