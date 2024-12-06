# frozen_string_literal: true

module Api
  module V1
    module OrganizationMemberships
      class ViewerPostsController < BaseController
        extend Apigen::Controller

        after_action :verify_policy_scoped, only: :index

        response model: PostPageSerializer, code: 200
        request_params do
          {
            after: { type: :string, required: false },
            limit: { type: :number, required: false },
            q: { type: :string, required: false },
            **order_schema(by: ["last_activity_at", "published_at"]),
          }
        end
        def index
          if params[:q].present?
            results = Post.scoped_search(query: params[:q], user_id: current_user.id, organization: current_organization)
            ids = results&.pluck(:id) || []

            render_json(
              PostPageSerializer,
              { results: policy_scope(Post.in_order_of(:id, ids).feed_includes) },
            )
          else
            render_page(
              PostPageSerializer,
              policy_scope(current_organization_membership.kept_published_posts.leaves.feed_includes),
              order: order_params(default: { last_activity_at: :desc, id: :desc }),
            )
          end
        end
      end
    end
  end
end
