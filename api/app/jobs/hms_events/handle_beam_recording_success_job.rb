# frozen_string_literal: true

module HmsEvents
  class HandleBeamRecordingSuccessJob < BaseJob
    sidekiq_options queue: "default", retry: 3

    def perform(payload)
      event = BeamRecordingSuccessEvent.new(JSON.parse(payload))
      recording = CallRecording.find_by(remote_beam_id: event.beam_id)
      return unless recording

      recording.update!(
        file_path: event.recording_path.gsub(%r{s3://[^/]+/}, ""),
        chat_file_path: event.chat_recording_path.gsub(%r{s3://[^/]+/}, ""),
        remote_recording_id: event.recording_id,
        size: event.size,
        max_width: event.max_width,
        max_height: event.max_height,
        duration: event.duration,
      )
      recording.call.update_recordings_duration!
      recording.call.trigger_stale
      recording.call.trigger_calls_stale
      ImgixAddAssetJob.perform_async(recording.file_path)
      ProcessCallRecordingChatJob.perform_async(recording.id)
    end
  end
end
