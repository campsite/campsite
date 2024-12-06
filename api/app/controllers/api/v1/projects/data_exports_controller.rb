# frozen_string_literal: true

module Api
  module V1
    module Projects
      class DataExportsController < BaseController
        extend Apigen::Controller

        response code: 200
        def create
          authorize(current_project, :export?)

          export = DataExport.create!(subject: current_project, member: current_organization_membership)
          DataExportJob.perform_async(export.id)

          render_ok
        end

        private

        def current_project
          @current_project ||= current_organization.projects.find_by!(public_id: params[:project_id])
        end
      end
    end
  end
end
