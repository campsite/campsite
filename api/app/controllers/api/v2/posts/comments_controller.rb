# frozen_string_literal: true

module Api
  module V2
    module Posts
      class CommentsController < BaseController
        extend Apigen::Controller

        include MarkdownEnrichable

        api_summary "List comments"
        api_description <<~DESC
          Lists all comments on a post.
        DESC
        response model: V2CommentPageSerializer, code: 200
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
            parent_id: {
              type: :string,
              required: false,
              description: "The ID of the parent comment.",
            },
            **v2_order_schema(by: Comment::PUBLIC_API_ALLOWED_ORDER_FIELDS),
          }
        end
        def index
          authorize(current_post, :list_comments?)

          comments = current_post.kept_comments.serializer_preloads

          comments = if params[:parent_id]
            comments.where(parent_id: current_parent.id)
          else
            comments.root
          end

          render_page(
            V2CommentPageSerializer,
            policy_scope(comments),
            order: order_params(default: { created_at: :asc }),
          )
        end

        api_summary "Create comment"
        api_description <<~DESC
          Creates a new comment on a post.
        DESC
        response model: V2CommentSerializer, code: 201
        request_params do
          {
            content_markdown: {
              type: :string,
              required: true,
              description: "The comment content in Markdown format.",
            },
            parent_id: {
              type: :string,
              required: false,
              description: "The ID of an existing comment to reply to. A single level of nested comments is supported.",
            },
          }
        end
        def create
          authorize(current_post, :create_comment?)

          comment = Comment.create_comment(
            params: {
              body_html: markdown_to_html(params[:content_markdown]),
            },
            subject: current_post,
            parent: current_parent,
            member: current_organization_membership,
            oauth_application: current_organization_membership ? nil : current_oauth_application,
          )

          if comment.errors.empty?
            render_json(V2CommentSerializer, comment, status: :created)
          else
            render_unprocessable_entity(comment)
          end
        end

        private

        def current_post
          @current_post ||= current_organization.kept_published_posts.find_by!(public_id: params[:post_id])
        end

        def current_parent
          return if params[:parent_id].blank?

          return @current_parent if defined?(@current_parent)

          @current_parent ||= current_post.comments.kept.find_by!(public_id: params[:parent_id])
        end

        def allowed_order_fields
          Comment::PUBLIC_API_ALLOWED_ORDER_FIELDS
        end
      end
    end
  end
end
