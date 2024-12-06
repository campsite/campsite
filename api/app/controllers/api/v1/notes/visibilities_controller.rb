# frozen_string_literal: true

module Api
  module V1
    module Notes
      class VisibilitiesController < BaseController
        extend Apigen::Controller

        response code: 204
        request_params do
          {
            visibility: { type: :string, enum: Note.visibilities.keys },
          }
        end
        def update
          authorize(current_note, :update_visibility?)

          current_note.update!(visibility: params[:visibility])
        end

        private

        def current_note
          @current_note ||= current_organization.notes.kept.find_by!(public_id: params[:note_id])
        end
      end
    end
  end
end
