# frozen_string_literal: true

module Api
  module V1
    class DataExportsController < BaseController
      extend Apigen::Controller

      response code: 200
      def create
        authorize(current_organization, :export?)

        export = DataExport.create!(subject: current_organization, member: current_organization_membership)
        DataExportJob.perform_async(export.id)

        render_ok
      end
    end
  end
end
