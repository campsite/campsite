# frozen_string_literal: true

module Api
  module V1
    module OrganizationMemberships
      class ForMePostsController < BaseController
        extend Apigen::Controller

        after_action :verify_policy_scoped, only: :index

        response model: PostPageSerializer, code: 200
        request_params do
          {
            after: { type: :string, required: false },
            limit: { type: :number, required: false },
            q: { type: :string, required: false },
            hide_resolved: { type: :boolean, required: false },
            **order_schema(by: ["last_activity_at", "published_at"]),
          }
        end
        def index
          scope = current_organization.kept_published_posts.with_active_project.feed_includes
          scope = scope.with_project_membership_for(current_user).or(scope.with_subscription_for(current_user))

          if params[:q].present?
            results = Post.scoped_search(query: params[:q], organization: current_organization)
            ids = results&.pluck(:id) || []

            render_json(
              PostPageSerializer,
              { results: policy_scope(scope.in_order_of(:id, ids)) },
            )
          else
            scope = scope.unresolved if to_bool(params[:hide_resolved])

            render_page(
              PostPageSerializer,
              policy_scope(scope.leaves),
              order: order_params(default: { last_activity_at: :desc, id: :desc }),
            )
          end
        end
      end
    end
  end
end
