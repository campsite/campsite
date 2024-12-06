# frozen_string_literal: true

module Api
  module V1
    class OnboardProjectsController < BaseController
      extend Apigen::Controller

      response code: 204
      request_params do
        {
          general_name: { type: :string },
          general_accessory: { type: :string, required: false },
          projects: {
            is_array: true,
            type: :object,
            properties: {
              name: { type: :string },
              accessory: { type: :string, required: false },
            },
          },
        }
      end
      def create
        authorize(current_organization, :create_project?)

        current_organization.general_project.update!(
          name: params[:general_name],
          accessory: params[:general_accessory],
        )

        project_params = params.require(:projects).map do |p|
          p.permit(:name, :accessory).merge(creator: current_organization_membership)
        end
        projects = current_organization.projects.create!(project_params)
        projects.each do |project|
          BulkProjectMemberships.new(
            project: project,
            creator_user: current_user,
          ).create!
        end
      end
    end
  end
end
