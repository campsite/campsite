# frozen_string_literal: true

module Api
  module V1
    class TagsController < BaseController
      extend Apigen::Controller

      after_action :verify_authorized, except: :posts
      after_action :verify_policy_scoped, only: :posts

      response model: TagPageSerializer, code: 200
      request_params do
        {
          q: { type: :string, required: false },
          after: { type: :string, required: false },
          limit: { type: :number, required: false },
        }
      end
      def index
        authorize(current_organization, :list_tags?)

        tags = if params[:q]
          current_organization.tags.search_by(params[:q])
        else
          current_organization.tags
        end

        render_page(TagPageSerializer, tags, { order: :desc })
      end

      response model: TagSerializer, code: 200
      def show
        authorize(current_tag, :show?)

        render_json(TagSerializer, current_tag)
      end

      response model: TagSerializer, code: 201
      request_params do
        { name: { type: :string } }
      end
      def create
        authorize(current_organization, :create_tag?)

        tag = current_organization.tags.create!(name: params[:name])

        render_json(TagSerializer, tag, status: :created)
      end

      response model: TagSerializer, code: 200
      request_params do
        { name: { type: :string } }
      end
      def update
        authorize(current_tag, :update?)

        current_tag.name = params[:name] if params[:name]
        current_tag.save!

        render_json(TagSerializer, current_tag)
      end

      response code: 204
      def destroy
        authorize(current_tag, :destroy?)

        current_tag.destroy!
      end

      response model: PostPageSerializer, code: 200
      request_params do
        {
          after: { type: :string, required: false },
          limit: { type: :number, required: false },
        }
      end
      def posts
        authorize(current_tag, :list_posts?)

        posts = policy_scope(current_tag.kept_published_posts).leaves.feed_includes

        render_page(
          PostPageSerializer,
          posts,
          order: { published_at: :desc, id: :desc },
        )
      end

      private

      def current_tag
        @current_tag ||= current_organization.tags.find_by!(name: params[:tag_name])
      end
    end
  end
end
