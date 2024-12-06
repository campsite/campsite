# frozen_string_literal: true

module Api
  module V1
    module Integrations
      module Zapier
        class ProjectsController < BaseController
          extend Apigen::Controller

          response model: ZapierProjectsSerializer, code: 200
          request_params do
            {
              name: { type: :string, required: false },
            }
          end
          def index
            projects = current_organization.projects.not_archived.not_private.order(name: :asc)
            projects = projects.where("LOWER(name) LIKE LOWER(?)", "#{params[:name]}%") if params[:name].present?

            render_json(ZapierProjectSerializer, projects)
          end
        end
      end
    end
  end
end
