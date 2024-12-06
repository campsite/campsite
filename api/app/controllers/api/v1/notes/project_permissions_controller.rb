# frozen_string_literal: true

module Api
  module V1
    module Notes
      class ProjectPermissionsController < BaseController
        extend Apigen::Controller

        response model: NoteSerializer, code: 200
        request_params do
          {
            project_id: { type: :string },
            permission: { type: :string, enum: Note.project_permissions.keys - ["none"] },
          }
        end
        def update
          authorize(current_note, :update_permission?)

          project = current_organization.projects.find_by!(public_id: params[:project_id])

          if current_note.add_to_project!(project: project, permission: params[:permission])
            render_json(NoteSerializer, current_note)
          else
            render_unprocessable_entity(current_note)
          end
        end

        response code: 204
        def destroy
          authorize(current_note, :destroy_permission?)

          current_note.remove_from_project!
        end

        private

        def current_note
          @current_note ||= current_organization.notes.kept.find_by!(public_id: params[:note_id])
        end
      end
    end
  end
end
