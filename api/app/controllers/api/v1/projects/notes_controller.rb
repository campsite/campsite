# frozen_string_literal: true

module Api
  module V1
    module Projects
      class NotesController < BaseController
        extend Apigen::Controller

        after_action :verify_authorized
        after_action :verify_policy_scoped, only: :index

        response model: NotePageSerializer, code: 200
        request_params do
          {
            after: { type: :string, required: false },
            limit: { type: :number, required: false },
            q: { type: :string, required: false },
            **order_schema(by: ["last_activity_at", "created_at"]),
          }
        end
        def index
          authorize(current_organization, :list_notes?)

          if params[:q].present?
            results = Note.scoped_search(query: params[:q], organization: current_organization, project_public_id: params[:project_id])
            ids = results&.pluck(:id) || []

            render_json(
              NotePageSerializer,
              { results: policy_scope(Note.in_order_of(:id, ids).serializer_preload) },
            )
          else
            render_page(
              NotePageSerializer,
              policy_scope(current_project.kept_notes.serializer_preload),
              order: order_params(default: { created_at: :desc, id: :desc }),
            )
          end
        end

        private

        def current_project
          @current_project ||= current_organization.projects.serializer_includes.find_by!(public_id: params[:project_id])
        end
      end
    end
  end
end
