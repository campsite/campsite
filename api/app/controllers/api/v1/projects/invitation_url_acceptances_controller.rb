# frozen_string_literal: true

module Api
  module V1
    module Projects
      class InvitationUrlAcceptancesController < BaseController
        skip_before_action :require_authenticated_organization_membership, only: :create

        extend Apigen::Controller

        response code: 204
        request_params do
          {
            token: { type: :string },
          }
        end
        def create
          current_project.join_via_guest_link!(current_user)
        end

        private

        def current_project
          current_organization.projects.find_by!(public_id: params[:project_id], invite_token: params[:token])
        end
      end
    end
  end
end
