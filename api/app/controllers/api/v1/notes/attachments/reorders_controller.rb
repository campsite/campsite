# frozen_string_literal: true

module Api
  module V1
    module Notes
      module Attachments
        class ReordersController < BaseController
          extend Apigen::Controller

          response code: 204
          request_params do
            {
              attachments: {
                type: :object,
                is_array: true,
                properties: {
                  id: { type: :string },
                  position: { type: :number },
                },
              },
            }
          end
          def update
            authorize(current_note, :update?)
            current_note.reorder_attachments(params[:attachments])
          end

          private

          def current_note
            @current_note ||= current_organization.notes.kept.find_by!(public_id: params[:note_id])
          end
        end
      end
    end
  end
end
