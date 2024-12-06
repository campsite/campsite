# frozen_string_literal: true

module Api
  module V1
    module Projects
      class ViewerDisplayPreferencesController < V1::BaseController
        extend Apigen::Controller

        response model: ProjectSerializer, code: 200
        request_params do
          {
            display_reactions: { type: :boolean },
            display_attachments: { type: :boolean },
            display_comments: { type: :boolean },
            display_resolved: { type: :boolean },
          }
        end
        def update
          authorize(current_project, :show?)

          preference = current_project.display_preferences.create_or_find_by!(organization_membership: current_organization_membership)

          preference.update!(
            display_reactions: to_bool(params[:display_reactions]),
            display_attachments: to_bool(params[:display_attachments]),
            display_comments: to_bool(params[:display_comments]),
            display_resolved: to_bool(params[:display_resolved]),
          )

          render_json(ProjectSerializer, current_project)
        end

        response model: ProjectSerializer, code: 200
        def destroy
          authorize(current_project, :show?)

          current_project.display_preferences.find_by(organization_membership: current_organization_membership)&.destroy!

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
