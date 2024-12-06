# frozen_string_literal: true

module Api
  module V1
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
          **order_schema(by: ["created_at", "last_activity_at"]),
        }
      end
      def index
        authorize(current_organization, :list_notes?)

        if params[:q].present?
          results = Note.scoped_search(query: params[:q], organization: current_organization)
          ids = results&.pluck(:id) || []

          render_json(
            NotePageSerializer,
            { results: policy_scope(Note.in_order_of(:id, ids).serializer_preload) },
          )
        else
          scope = case params[:filter]
          when "created"
            # DEPRECATED 7/17/24
            current_organization.notes.only_user(current_user)
          when "projects"
            # DEPRECATED 7/15/24
            current_organization_membership.kept_active_project_membership_notes
          else
            current_organization.notes
          end
          scope = policy_scope(scope.kept.serializer_preload)

          render_page(NotePageSerializer, scope, order: order_params(default: { last_activity_at: :desc }))
        end
      end

      response model: NoteSerializer, code: 200
      def show
        authorize(current_note, :show?)
        render_json(NoteSerializer, current_note)
      end

      response model: NoteSerializer, code: 201
      request_params do
        {
          title: { type: :string, required: false },
          description_html: { type: :string, required: false },
          project_id: { type: :string, required: false },
        }
      end
      def create
        authorize(current_organization, :create_note?)

        project = current_organization.projects.find_by!(public_id: params[:project_id]) if params[:project_id].present?
        permission = project ? :view : :none

        note = current_organization_membership.notes.create!(
          title: params[:title],
          description_html: params[:description_html],
          project: project,
          project_permission: permission,
        )

        if note.errors.empty?
          render_json(NoteSerializer, note, status: :created)
        else
          render_unprocessable_entity(note)
        end
      end

      response model: NoteSerializer, code: 200
      request_params do
        {
          title: { type: :string, required: false },
        }
      end
      def update
        authorize(current_note, :update?)

        if params.key?(:title)
          current_note.title = params[:title]
        end

        if current_note.save
          render_json(NoteSerializer, current_note)
        else
          render_unprocessable_entity(current_note)
        end
      end

      response code: 204
      def destroy
        authorize(current_note, :destroy?)

        current_note.discard_by_actor(current_organization_membership)
      end

      private

      def current_note
        @current_note ||= current_organization.notes.kept.serializer_preload.find_by!(public_id: params[:id])
      end
    end
  end
end
