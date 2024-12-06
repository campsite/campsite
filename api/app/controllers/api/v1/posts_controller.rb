# frozen_string_literal: true

module Api
  module V1
    class PostsController < BaseController
      extend Apigen::Controller

      skip_before_action :require_authenticated_user, only: :show
      skip_before_action :require_authenticated_organization_membership, only: :show

      after_action :verify_authorized, except: :index
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
        authorize(current_organization, :list_posts?)

        if params[:q].present?
          results = Post.scoped_search(query: params[:q], organization: current_organization)
          ids = results&.pluck(:id) || []

          render_json(
            PostPageSerializer,
            { results: policy_scope(Post.in_order_of(:id, ids).feed_includes) },
          )
        else
          render_page(
            PostPageSerializer,
            policy_scope(current_organization.kept_published_posts.leaves.feed_includes),
            order: order_params(default: { last_activity_at: :desc, id: :desc }),
          )
        end
      end

      response model: PostSerializer, code: 200
      def show
        authorize(current_post, :show?)
        render_json(PostSerializer, current_post)
      end

      response model: PostSerializer, code: 201
      request_params do
        {
          description: { type: :string, required: false },
          description_html: { type: :string, required: false },
          project_id: { type: :string, required: false },
          unfurled_link: { type: :string, required: false, nullable: true },
          parent_id: { type: :string, required: false, nullable: true },
          note: { type: :boolean, required: false },
          note_id: { type: :string, required: false, nullable: true },
          from_message_id: { type: :string, required: false, nullable: true },
          links: {
            type: :object,
            is_array: true,
            properties: {
              name: { type: :string },
              url: { type: :string },
            },
          },
          attachment_ids: { type: :string, is_array: true, required: false },
          onboarding_step: { type: :string, required: false },
          feedback_request_member_ids: { type: :string, is_array: true, required: false },
          poll: {
            type: :object,
            required: false,
            properties: {
              description: { type: :string },
              options: { type: :object, is_array: true, properties: { description: { type: :string } } },
            },
          },
          status: { type: :string, enum: Post.statuses.keys, required: false },
          title: { type: :string, required: false },
          draft: { type: :boolean, required: false },

          # deprecating this object from the client on 5/22/24 in favor of `attachment_ids`.
          attachments: {
            type: :object,
            is_array: true,
            required: false,
            properties: Api::V1::AttachmentsController::CREATE_PARAMS,
          },
        }
      end
      def create
        authorize(current_organization, :create_post?)

        project = if params[:project_id]
          current_organization.projects.find_by!(public_id: params[:project_id])
        else
          current_organization.general_project
        end

        authorize(project, :create_post?)

        if params[:parent_id]
          parent = policy_scope(current_organization.kept_published_posts).find_by!(public_id: params[:parent_id])
        end

        post = Post.create_post(
          params: params.permit!,
          parent: parent,
          project: project,
          organization: current_organization,
          member: current_organization_membership,
        )

        if post.errors.empty?
          render_json(PostSerializer, post, status: :created)
        else
          render_unprocessable_entity(post)
        end
      end

      response model: PostSerializer, code: 200
      request_params do
        {
          title: { type: :string, required: false },
          description_html: { type: :string, required: false },
          project_id: { type: :string, required: false, nullable: true },
          unfurled_link: { type: :string, required: false, nullable: true },
          note: { type: :boolean, required: false },
          status: { type: :string, enum: Post.statuses.keys, required: false },
          feedback_request_member_ids: { type: :string, is_array: true, required: false },
          attachment_ids: { type: :string, is_array: true, required: false },
        }
      end
      def update
        authorize(current_post, :update?)

        if params[:project_id]
          project = policy_scope(current_organization.projects).find_by!(public_id: params[:project_id])
        end

        current_post.update_post(actor: current_organization_membership, organization: current_organization, project: project, params: params)

        if current_post.errors.empty?
          render_json(PostSerializer, current_post)
        else
          render_unprocessable_entity(current_post)
        end
      end

      response code: 204
      def destroy
        authorize(current_post, :destroy?)

        current_post.discard_by_actor(current_organization_membership)
      end

      response code: 204
      def subscribe
        authorize(current_post, :subscribe?)

        current_post.subscriptions.create!(user: current_user)
      end

      response code: 204
      def unsubscribe
        authorize(current_post, :unsubscribe?)

        current_post.subscriptions.find_by!(user: current_user).destroy!
      end

      response model: PresignedPostFieldsSerializer, code: 200
      request_params do
        {
          mime_type: { type: :string },
        }
      end
      def presigned_fields
        authorize(current_organization, :show_presigned_fields?)

        presigned_fields = current_organization.generate_post_presigned_post_fields(params[:mime_type])
        render_json(PresignedPostFieldsSerializer, presigned_fields)
      end

      private

      def current_post
        raise ActiveRecord::RecordNotFound unless current_organization

        @current_post ||= current_organization.kept_posts
          .feed_includes
          .find_by!(public_id: params[:post_id])
      end
    end
  end
end
