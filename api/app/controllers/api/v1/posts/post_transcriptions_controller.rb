# frozen_string_literal: true

module Api
  module V1
    module Posts
      class PostTranscriptionsController < PostsBaseController
        around_action :force_database_writing_role, only: [:show]

        skip_before_action :require_authenticated_user, only: :show
        skip_before_action :require_authenticated_organization_membership, only: :show

        def show
          authorize(current_post, :show?)

          attachment = current_post.attachments.find_by!(public_id: params[:attachment_id])

          if attachment.transcription_job_id.blank?
            render_json(TranscriptionSerializer, { status: "ERROR" })
            return
          end

          attachment.update_transcription_job

          render_json(TranscriptionSerializer, {
            status: attachment.transcription_job_status,
            vtt: attachment.transcription_vtt,
          })
        end
      end
    end
  end
end
