# frozen_string_literal: true

module Api
  module V1
    module OrganizationMemberships
      class ProjectMembershipListsController < BaseController
        extend Apigen::Controller

        after_action :verify_authorized

        response model: ProjectMembershipListSerializer, code: 200
        request_params do
          {
            add_project_ids: { type: :string, is_array: true },
            remove_project_ids: { type: :string, is_array: true },
          }
        end
        def update
          authorize(organization_membership, :bulk_update_project_memberships?)

          add_project_ids = Array(params[:add_project_ids]).compact.uniq
          remove_project_ids = Array(params[:remove_project_ids]).compact.uniq
          projects_by_public_id = current_organization.projects.where(public_id: add_project_ids + remove_project_ids).index_by(&:public_id)

          add_project_ids.each { |id| projects_by_public_id[id]&.add_member!(organization_membership) }
          remove_project_ids.each { |id| projects_by_public_id[id]&.remove_member!(organization_membership) }

          render_json(
            ProjectMembershipListSerializer,
            { data: policy_scope(organization_membership.kept_project_memberships.reload.serializer_includes) },
          )
        end

        private

        def organization_membership
          @organization_membership ||= current_organization.kept_memberships.joins(:user).find_by!(user: { username: params[:member_username] })
        end
      end
    end
  end
end
