# frozen_string_literal: true

module Api
  module V1
    module Projects
      class ReadsController < BaseController
        extend Apigen::Controller

        response code: 201
        def create
          authorize(current_project, :create_read?)
          current_project.mark_read(current_organization_membership)
          render(json: {}, status: :created)
        end

        response code: 204
        def destroy
          authorize(current_project, :mark_unread?)
          current_project.mark_unread(current_organization_membership)
        end

        private

        def current_project
          @current_project ||= current_organization.projects.eager_load(:views).find_by!(public_id: params[:project_id])
        end
      end
    end
  end
end
