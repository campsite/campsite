# frozen_string_literal: true

module Api
  module V1
    module OrganizationMemberships
      class PersonalDraftPostsController < BaseController
        extend Apigen::Controller

        after_action :verify_policy_scoped, only: :index

        response model: PostPageSerializer, code: 200
        request_params do
          {
            after: { type: :string, required: false },
            limit: { type: :number, required: false },
            **order_schema(by: ["last_activity_at"]),
          }
        end
        def index
          render_page(
            PostPageSerializer,
            policy_scope(current_organization_membership.kept_draft_posts.leaves.feed_includes),
            order: order_params(default: { last_activity_at: :desc, id: :desc }),
          )
        end
      end
    end
  end
end
