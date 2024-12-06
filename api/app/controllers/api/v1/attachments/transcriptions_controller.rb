# frozen_string_literal: true

module Api
  module V1
    module Attachments
      class TranscriptionsController < BaseController
        around_action :force_database_writing_role, only: [:show]

        skip_before_action :require_authenticated_user, only: :show
        skip_before_action :require_authenticated_organization_membership, only: :show

        extend Apigen::Controller

        response model: TranscriptionSerializer, code: 200
        def show
          authorize(current_attachment.subject, :show_attachments?)

          if current_attachment.transcription_job_id.blank?
            render_json(TranscriptionSerializer, { status: "ERROR" })
            return
          end

          current_attachment.update_transcription_job

          render_json(TranscriptionSerializer, {
            status: current_attachment.transcription_job_status,
            vtt: current_attachment.transcription_vtt,
          })
        end

        private

        def current_attachment
          @current_attachment ||= Attachment.find_by!(public_id: params[:attachment_id])
        end
      end
    end
  end
end
