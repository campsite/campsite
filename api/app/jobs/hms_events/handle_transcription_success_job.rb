# frozen_string_literal: true

module HmsEvents
  class HandleTranscriptionSuccessJob < BaseJob
    sidekiq_options queue: "default", retry: 3

    def perform(payload)
      event = TranscriptionSuccessEvent.new(JSON.parse(payload))
      recording = CallRecording.find_by(remote_transcription_id: event.transcription_id) ||
        CallRecording.find_by(remote_recording_id: event.recording_id)
      return unless recording

      recording.update!(
        remote_transcription_id: event.transcription_id,
        transcription_succeeded_at: event.succeeded_at,
        transcript_json_file_path: event.transcript_json_path&.gsub(%r{s3://[^/]+/}, ""),
        transcript_srt_file_path: event.transcript_srt_path&.gsub(%r{s3://[^/]+/}, ""),
        transcript_txt_file_path: event.transcript_txt_path&.gsub(%r{s3://[^/]+/}, ""),
      )
      ProcessCallRecordingTranscriptionJob.perform_async(recording.id)
    end
  end
end
