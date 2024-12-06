# frozen_string_literal: true

module Api
  module V1
    module Projects
      class PostsController < BaseController
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
          authorize(current_project, :list_posts?)

          if params[:q].present?
            results = Post.scoped_search(query: params[:q], organization: current_organization, project_public_id: params[:project_id])
            ids = results&.pluck(:id) || []

            render_json(
              PostPageSerializer,
              { results: policy_scope(Post.in_order_of(:id, ids).feed_includes) },
            )
          else
            scope = current_project.kept_published_posts.leaves.feed_includes
            scope = scope.unresolved if to_bool(params[:hide_resolved])

            render_page(
              PostPageSerializer,
              policy_scope(scope),
              order: order_params(default: { published_at: :desc, id: :desc }),
            )
          end
        end

        private

        def current_project
          @current_project ||= current_organization.projects.find_by!(public_id: params[:project_id])
        end
      end
    end
  end
end
