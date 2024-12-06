# frozen_string_literal: true

module Api
  module V1
    module Posts
      class FollowUpsController < PostsBaseController
        extend Apigen::Controller

        after_action :verify_authorized

        response model: FollowUpSerializer, code: 201
        request_params do
          {
            show_at: { type: :string, required: true },
          }
        end
        def create
          authorize(current_post, :create_follow_up?)

          follow_up = current_post.follow_ups.create!(
            organization_membership: current_organization_membership,
            show_at: params[:show_at],
          )

          Notification.discard_home_inbox_notifications(
            member: current_organization_membership,
            follow_up_subject: current_post,
          )

          render_json(FollowUpSerializer, follow_up, status: :created)
        end
      end
    end
  end
end
