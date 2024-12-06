# frozen_string_literal: true

module Api
  module V1
    module Notes
      class AttachmentsController < BaseController
        extend Apigen::Controller

        around_action :retry_deadlock, only: :destroy

        response model: AttachmentSerializer, code: 201
        request_params do
          Api::V1::AttachmentsController::CREATE_PARAMS
        end
        def create
          authorize(current_note, :update?)
          attachment = current_note.attachments.create!(params.permit(Api::V1::AttachmentsController::CREATE_PARAMS.keys))
          render_json(AttachmentSerializer, attachment, status: :created)
        end

        response model: AttachmentSerializer, code: 200
        request_params do
          {
            preview_file_path: { type: :string, required: false },
            width: { type: :number, required: false },
            height: { type: :number, required: false },
          }
        end
        def update
          authorize(current_note, :update?)

          attachment = current_note.attachments.find_by!(public_id: params[:id])

          if params.key?(:preview_file_path)
            attachment.preview_file_path = params[:preview_file_path]
          end

          if params.key?(:width)
            attachment.width = params[:width]
          end

          if params.key?(:height)
            attachment.height = params[:height]
          end

          attachment.save!

          render_json(AttachmentSerializer, attachment, status: :ok)
        end

        response model: NoteSerializer, code: 200
        def destroy
          authorize(current_note, :update?)
          current_note.attachments.find_by!(public_id: params[:id]).destroy!
          render_json(NoteSerializer, current_note, status: :ok)
        end

        private

        def current_note
          @current_note ||= current_organization.notes.kept.find_by!(public_id: params[:note_id])
        end
      end
    end
  end
end
