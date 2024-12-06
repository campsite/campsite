# frozen_string_literal: true

module Api
  module V1
    module CallRecordings
      class TranscriptionsController < BaseController
        extend Apigen::Controller

        after_action :verify_authorized

        response code: 200, model: CallRecordingTranscriptionSerializer
        def show
          recording = CallRecording
            .eager_load(
              call: :room,
              speakers: {
                call_peer: { organization_membership: OrganizationMembership::SERIALIZER_EAGER_LOAD },
              },
            )
            .find_by!(public_id: params[:call_recording_id])
          authorize(recording, :show?)

          render_json(CallRecordingTranscriptionSerializer, recording)
        end
      end
    end
  end
end
