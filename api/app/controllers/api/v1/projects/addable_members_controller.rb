# frozen_string_literal: true

module Api
  module V1
    module Projects
      class AddableMembersController < BaseController
        extend Apigen::Controller

        after_action :verify_authorized
        after_action :verify_policy_scoped, only: :index

        response model: OrganizationMemberPageSerializer, code: 200
        request_params do
          {
            after: { type: :string, required: false },
            limit: { type: :number, required: false },
          }
        end
        def index
          authorize(current_project, :list_addable_members?)

          scope = policy_scope(current_organization.kept_memberships.excluding(current_project.members).serializer_eager_load)

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
