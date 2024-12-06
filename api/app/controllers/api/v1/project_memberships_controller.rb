# frozen_string_literal: true

module Api
  module V1
    class ProjectMembershipsController < BaseController
      extend Apigen::Controller

      after_action :verify_authorized
      after_action :verify_policy_scoped, only: :index

      response model: ProjectMembershipSerializer, is_array: true, code: 200
      def index
        authorize(current_organization_membership, :show?)

        render_json(
          ProjectMembershipSerializer,
          policy_scope(current_organization_membership.kept_project_memberships.serializer_includes.order(:position)),
        )
      end
    end
  end
end
