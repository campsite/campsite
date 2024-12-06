# frozen_string_literal: true

module Api
  module V1
    module Projects
      class MembersController < BaseController
        extend Apigen::Controller

        after_action :verify_authorized, except: :index
        after_action :verify_policy_scoped, only: :index

        response model: OrganizationMemberPageSerializer, code: 200
        request_params do
          {
            after: { type: :string, required: false },
            limit: { type: :number, required: false },
            organization_membership_id: { type: :string, required: false },
            roles: { type: :string, enum: Role::NAMES, required: false, is_array: true },
            exclude_roles: { type: :string, enum: Role::NAMES, required: false, is_array: true },
          }
        end
        def index
          authorize(current_project, :list_project_memberships?)

          scope = policy_scope(current_project.members.serializer_eager_load)

          if params[:organization_membership_id].present?
            scope = scope.where(public_id: params[:organization_membership_id])
          end

          if params[:roles].present?
            scope = scope.where(role_name: params[:roles])
          end

          if params[:exclude_roles].present?
            scope = scope.where.not(role_name: params[:exclude_roles])
          end

          render_page(OrganizationMemberPageSerializer, scope)
        end

        private

        def current_project
          @current_project ||= current_organization.projects.find_by!(public_id: params[:project_id])
        end
      end
    end
  end
end
