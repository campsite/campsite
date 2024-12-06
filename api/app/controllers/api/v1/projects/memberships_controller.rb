# frozen_string_literal: true

module Api
  module V1
    module Projects
      class MembershipsController < BaseController
        extend Apigen::Controller

        after_action :verify_authorized, except: :index
        after_action :verify_policy_scoped, only: :index

        response model: ProjectMembershipSerializer, code: 201
        request_params do
          {
            user_id: { type: :string },
          }
        end
        def create
          authorize(current_project, :create_project_membership?)

          organization_membership = current_organization.kept_memberships.joins(:user).find_by!(user: { public_id: params[:user_id] })
          project_membership = current_project.add_member!(organization_membership)
          current_project.views.find_or_initialize_by(organization_membership: current_organization_membership).update!(last_viewed_at: Time.current)

          render_json(ProjectMembershipSerializer, project_membership, status: :created)
        end

        response model: ProjectSerializer, code: 200
        request_params do
          {
            user_id: { type: :string },
          }
        end
        def destroy
          authorize(current_project, :remove_project_membership?)

          organization_membership = current_organization.memberships.joins(:user).find_by!(user: { public_id: params[:user_id] })
          current_project.remove_member!(organization_membership)

          render_json(ProjectSerializer, current_project)
        end

        private

        def current_project
          @current_project ||= current_organization.projects.serializer_includes.find_by!(public_id: params[:project_id])
        end
      end
    end
  end
end
