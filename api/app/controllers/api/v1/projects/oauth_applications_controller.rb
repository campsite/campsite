# frozen_string_literal: true

module Api
  module V1
    module Projects
      class OauthApplicationsController < BaseController
        extend Apigen::Controller

        response model: OauthApplicationSerializer, is_array: true, code: 200
        def index
          authorize(current_project, :manage_integrations?)
          render_json(OauthApplicationSerializer, current_project.kept_oauth_applications)
        end

        response model: ProjectMembershipSerializer, code: 200
        request_params do
          {
            oauth_application_id: { type: :string },
          }
        end
        def create
          authorize(current_project, :manage_integrations?)

          oauth_application_member = current_project.add_oauth_application!(
            current_organization.kept_oauth_applications.find_by!(public_id: params[:oauth_application_id]),
          )

          render_json(ProjectMembershipSerializer, oauth_application_member)
        end

        response code: 204
        def destroy
          authorize(current_project, :manage_integrations?)

          current_project.remove_oauth_application!(
            current_project.oauth_applications.find_by!(public_id: params[:id]),
          )
        end

        private

        def current_project
          @current_project ||= current_organization.projects.find_by!(public_id: params[:project_id])
        end
      end
    end
  end
end
