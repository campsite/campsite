# frozen_string_literal: true

module Api
  module V1
    class OrganizationMembersController < BaseController
      STATUSES = [
        DEACTIVATED_STATUS = "deactivated",
      ].freeze

      extend Apigen::Controller

      after_action :verify_authorized, except: :posts
      after_action :verify_policy_scoped, only: [:index, :posts]

      response model: OrganizationMemberPageSerializer, code: 200
      request_params do
        {
          q: { type: :string, required: false },
          status: { type: :string, enum: STATUSES, required: false },
          roles: { type: :string, enum: Role::NAMES, required: false, is_array: true },
          after: { type: :string, required: false },
          limit: { type: :number, required: false },
          **order_schema(by: ["created_at", "last_seen_at"]),
        }
      end
      def index
        authorize(current_organization, :list_members?)

        memberships = if to_bool(params[:deactivated]) || params[:status] == DEACTIVATED_STATUS
          current_organization.discarded_memberships.serializer_eager_load
        else
          current_organization.kept_memberships.serializer_eager_load
        end

        if params[:roles]
          memberships = memberships.where(role_name: params[:roles])
        end

        if params[:q]
          memberships = memberships.search_by(params[:q])
        end

        render_page(OrganizationMemberPageSerializer, policy_scope(memberships), order: order_params(default: { last_seen_at: :desc, id: :desc }))
      end

      response model: OrganizationMemberSerializer, code: 200
      def show
        membership = current_organization.memberships.serializer_eager_load.find_by!(user: { username: params[:username] })
        authorize(membership, :show?)

        render_json(OrganizationMemberSerializer, membership)
      end

      response model: PostPageSerializer, code: 200
      request_params do
        {
          after: { type: :string, required: false },
          limit: { type: :number, required: false },
          **order_schema(by: ["last_activity_at", "published_at"]),
        }
      end
      def posts
        membership = current_organization.memberships.serializer_eager_load.find_by!(user: { username: params[:username] })
        authorize(membership, :show?)

        posts = policy_scope(membership.kept_published_posts).leaves
          .where(organization: current_organization)
          .feed_includes

        render_page(
          PostPageSerializer,
          posts,
          order: order_params(default: { published_at: :desc, id: :desc }),
        )
      end

      response model: OrganizationMemberSerializer, code: 200
      request_params do
        {
          role: { type: :string },
        }
      end
      def update
        membership = current_organization.kept_memberships.find_by!(public_id: params[:id])
        authorize(membership, :update_member_role?)

        membership = membership.update_role(current_user: current_user, role_name: params[:role])

        if membership.errors.empty?
          render_json(OrganizationMemberSerializer, membership)
        else
          render_error(status: :unprocessable_entity, code: "unprocessable", message: membership.errors.full_messages.first)
        end
      end

      response code: 204
      def reactivate
        membership = current_organization.memberships.find_by!(public_id: params[:id])
        authorize(membership, :update_member_role?)

        membership.undiscard!
      end

      response code: 204
      def destroy
        membership = current_organization.kept_memberships.find_by!(public_id: params[:id])
        authorize(membership, :destroy_member?)

        current_organization.remove_member(membership)
      rescue Organization::RemoveMember::Error => ex
        render_error(status: :unprocessable_entity, code: "unprocessable", message: ex.message)
      end
    end
  end
end
