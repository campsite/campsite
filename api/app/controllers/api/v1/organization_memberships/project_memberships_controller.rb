# frozen_string_literal: true

module Api
  module V1
    module OrganizationMemberships
      class ProjectMembershipsController < BaseController
        extend Apigen::Controller

        after_action :verify_authorized
        after_action :verify_policy_scoped, only: :index

        response model: ProjectMembershipListSerializer, code: 200
        def index
          authorize(organization_membership, :show?)

          render_json(
            ProjectMembershipListSerializer,
            { data: policy_scope(organization_membership.kept_project_memberships.serializer_includes) },
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
