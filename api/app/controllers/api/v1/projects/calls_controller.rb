# frozen_string_literal: true

module Api
  module V1
    module Projects
      class CallsController < BaseController
        extend Apigen::Controller

        after_action :verify_authorized
        after_action :verify_policy_scoped, only: :index

        response model: CallPageSerializer, code: 200
        request_params do
          {
            after: { type: :string, required: false },
            limit: { type: :number, required: false },
            q: { type: :string, required: false },
          }
        end
        def index
          authorize(current_organization, :list_calls?)

          if params[:q].present?
            results = Call.scoped_search(query: params[:q], organization: current_organization, project_public_id: params[:project_id])
            ids = results&.pluck(:id) || []

            render_json(
              CallPageSerializer,
              { results: policy_scope(Call.in_order_of(:id, ids).serializer_preload) },
            )
          else
            render_page(CallPageSerializer, policy_scope(current_project.completed_recorded_calls.serializer_preload))
          end
        end

        private

        def current_project
          @current_project ||= current_organization.projects.find_by!(public_id: params[:project_id])
        end
      end
    end
  end
end
