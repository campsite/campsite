# frozen_string_literal: true

module Api
  module V1
    module OrganizationMemberships
      class DataExportsController < BaseController
        extend Apigen::Controller

        response code: 200
        def create
          authorize(current_organization_membership, :export?)

          export = DataExport.create!(subject: current_organization_membership, member: current_organization_membership)
          DataExportJob.perform_async(export.id)

          render_ok
        end
      end
    end
  end
end
