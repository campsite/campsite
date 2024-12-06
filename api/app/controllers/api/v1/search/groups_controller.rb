# frozen_string_literal: true

module Api
  module V1
    module Search
      class GroupsController < BaseController
        extend Apigen::Controller

        FOCUS_TYPES = ["projects", "people", "tags", "posts", "calls", "notes"].freeze

        after_action :verify_authorized
        after_action :verify_policy_scoped, only: :index

        response model: SearchGroupSerializer, code: 200
        request_params do
          {
            q: { type: :string, required: false },
            focus: { type: :string, enum: FOCUS_TYPES, required: false },
          }
        end
        def index
          authorize(current_organization, :search?)
          results = {
            projects: search_projects,
            members: search_people,
            tags: search_tags,
            calls: search_calls,
            notes: search_notes,
          }.merge(search_posts)
          render_json(SearchGroupSerializer, results)
        end

        private

        def can_search?(focus)
          params[:focus].nil? || params[:focus] == focus
        end

        def search_projects
          return [] unless can_search?("projects")

          policy_scope(current_organization.projects)
            .where(archived_at: nil)
            .search_by(params[:q])
            .limit(10)
            .load_async
        end

        def search_people
          return [] unless can_search?("people")

          policy_scope(current_organization.kept_memberships)
            .search_by(params[:q])
            .serializer_eager_load
            .limit(10)
            .load_async
        end

        def search_tags
          return [] unless can_search?("tags")

          policy_scope(current_organization.tags)
            .search_by(params[:q])
            .limit(10)
            .load_async
        end

        def search_calls
          return [] unless can_search?("calls")

          result = Call.scoped_search(
            query: params[:q] || "",
            organization: current_organization,
            limit: 10,
          )

          policy_scope(Call.in_order_of(:id, result.pluck(:id))).serializer_preload
        end

        def search_notes
          return [] unless can_search?("notes")

          result = Note.scoped_search(
            query: params[:q] || "",
            organization: current_organization,
            limit: 10,
          )

          policy_scope(Note.in_order_of(:id, result.pluck(:id))).eager_load(member: OrganizationMembership::SERIALIZER_EAGER_LOAD)
        end

        def search_posts
          return { posts: [], posts_total_count: 0 } unless can_search?("posts")

          result = Post.scoped_search(
            query: params[:q] || "",
            organization: current_organization,
            limit: 10,
          )

          {
            posts: policy_scope(Post.in_order_of(:id, result.pluck(:id)).includes(SearchPostSerializer::POST_INCLUDES)),
            posts_total_count: result.total_count,
          }
        end
      end
    end
  end
end
