# frozen_string_literal: true

module Api
  module V1
    module Projects
      class ViewsController < BaseController
        extend Apigen::Controller

        after_action :verify_authorized

        response model: ProjectSerializer, code: 201
        def create
          authorize(current_project, :show?)
          current_project.mark_read(current_organization_membership)
          render_json(ProjectSerializer, current_project, status: :created)
        end

        private

        def current_project
          @current_project ||= current_organization.projects.serializer_includes.find_by!(public_id: params[:project_id])
        end
      end
    end
  end
end
