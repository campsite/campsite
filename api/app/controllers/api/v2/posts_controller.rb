# frozen_string_literal: true

module Api
  module V2
    class PostsController < BaseController
      extend Apigen::Controller

      include MarkdownEnrichable

      api_summary "List posts"
      api_description <<~DESC
        Lists posts.
      DESC
      response model: V2PostPageSerializer, code: 200
      request_params do
        {
          after: {
            type: :string,
            required: false,
            description: "Use with `next_cursor` and `prev_cursor` in the response to paginate through results.",
          },
          limit: {
            type: :number,
            required: false,
            description: "Specifies how many records to return. The default and maximum is 50.",
          },
          channel_id: {
            type: :string,
            required: false,
            description: "Filters the posts to only include those from a specific channel.",
          },
          **v2_order_schema(by: Post::PUBLIC_API_ALLOWED_ORDER_FIELDS),
        }
      end
      def index
        authorize(current_organization, :list_posts?)

        posts = current_organization.kept_published_posts.public_api_includes

        if params[:channel_id].present?
          project = current_organization.projects.find_by!(public_id: params[:channel_id])

          authorize(project, :list_posts?)

          posts = posts.where(project: project)
        end

        render_page(
          V2PostPageSerializer,
          policy_scope(posts),
          order: order_params(default: { published_at: :desc }),
        )
      end

      api_summary "Create post"
      api_description <<~DESC
        Creates a new post.
      DESC
      response model: V2PostSerializer, code: 201
      request_params do
        {
          title: {
            type: :string,
            required: false,
          },
          content_markdown: {
            type: :string,
            required: true,
            description: "The post content in Markdown format.",
          },
          channel_id: {
            type: :string,
            required: true,
            description: "The ID of the channel to create the post in.",
          },
        }
      end
      def create
        authorize(current_organization, :create_post?)

        if params[:channel_id].blank?
          return render_error(status: :unprocessable_entity, code: "unprocessable", message: "Channel ID is required.")
        end

        project = current_organization.projects.find_by!(public_id: params[:channel_id])

        authorize(project, :create_post?)

        post = Post::CreatePost.new(
          params: {
            description_html: markdown_to_html(markdown),
            title: params[:title],
          },
          project: project,
          organization: current_organization,
          member: current_organization_membership,
          oauth_application: current_organization_membership ? nil : current_oauth_application,
        ).run

        if post.errors.empty?
          render_json(V2PostSerializer, post, status: :created)
        else
          render_unprocessable_entity(post)
        end
      end

      api_summary "Get post"
      api_description <<~DESC
        Gets a post.
      DESC
      response model: V2PostSerializer, code: 200
      def show
        authorize(current_post, :show?)

        render_json(V2PostSerializer, current_post)
      end

      private

      def markdown
        content = params[:content_markdown] || params[:content]
        content.present? ? content.strip : ""
      end

      def current_post
        @current_post ||= current_organization
          .kept_published_posts
          .public_api_includes
          .find_by!(public_id: params[:id])
      end

      def allowed_order_fields
        Post::PUBLIC_API_ALLOWED_ORDER_FIELDS
      end
    end
  end
end
