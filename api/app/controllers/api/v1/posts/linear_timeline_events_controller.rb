# frozen_string_literal: true

module Api
  module V1
    module Posts
      class LinearTimelineEventsController < PostsBaseController
        extend Apigen::Controller

        after_action :verify_authorized
        after_action :verify_policy_scoped, only: :index

        response model: TimelineEventPageSerializer, code: 200
        request_params do
          {
            after: { type: :string, required: false },
            limit: { type: :number, required: false },
          }
        end
        def index
          authorize(current_post, :list_timeline_events?)

          render_page(
            TimelineEventPageSerializer,
            policy_scope(TimelineEvent.where(subject: [current_post, current_post.kept_comments]).linear_actions),
            order: :asc,
          )
        end
      end
    end
  end
end
