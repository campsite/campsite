# frozen_string_literal: true

module Api
  module V1
    module Comments
      class FollowUpsController < BaseController
        extend Apigen::Controller

        after_action :verify_authorized

        response model: FollowUpSerializer, code: 201
        request_params do
          {
            show_at: { type: :string, required: true },
          }
        end
        def create
          authorize(current_comment, :create_follow_up?)

          follow_up = current_comment.follow_ups.create!(
            organization_membership: current_organization_membership,
            show_at: params[:show_at],
          )

          Notification.discard_home_inbox_notifications(
            member: current_organization_membership,
            follow_up_subject: current_comment,
          )

          render_json(FollowUpSerializer, follow_up, status: :created)
        end

        private

        def current_comment
          @current_comment ||= Comment.kept.preload(:subject).find_by!(public_id: params[:comment_id])
        end
      end
    end
  end
end
