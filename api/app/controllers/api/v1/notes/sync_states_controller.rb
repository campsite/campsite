# frozen_string_literal: true

module Api
  module V1
    module Notes
      class SyncStatesController < BaseController
        extend Apigen::Controller

        response model: NoteSyncSerializer, code: 200
        def show
          note = current_organization.notes.kept.find_by!(public_id: params[:note_id])
          authorize(note, :show?)
          render_json(NoteSyncSerializer, note)
        end

        response code: 200
        request_params do
          {
            description_html: { type: :string },
            description_state: { type: :string },
            description_schema_version: { type: :integer },
          }
        end
        def update
          note = current_organization.notes.find_by!(public_id: params[:note_id])

          authorize(note, :sync?)

          if !params[:description_schema_version].nil? && params[:description_schema_version] < note.description_schema_version
            render_unprocessable_entity(note) && return
          end

          note.event_actor = current_organization_membership
          note.description_html = params[:description_html]
          note.description_state = params[:description_state]
          note.description_schema_version = params[:description_schema_version]

          if note.save
            render(json: {}, status: :ok)
          else
            render_unprocessable_entity(note)
          end
        end
      end
    end
  end
end
