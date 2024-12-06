# frozen_string_literal: true

class ProcessCallRecordingTranscriptionJob < BaseJob
  sidekiq_options queue: "background", retry: 3

  def perform(call_recording_id)
    call_recording = CallRecording.find(call_recording_id)

    if call_recording.transcript_srt_url
      srt = Down.download(call_recording.transcript_srt_url)&.read

      if srt.present?
        # https://github.com/opencoconut/webvtt-ruby/blob/e07d59220260fce33ba5a0c3b355e3ae88b99457/lib/webvtt/parser.rb#L19-L26
        vtt = srt.gsub(/(:|^)(\d)(,|:)/, '\10\2\3').gsub(/([0-9]{2}:[0-9]{2}:[0-9]{2})([,])([0-9]{3})/, '\1.\3').gsub("\r\n", "\n")
        vtt = "WEBVTT\n\n#{vtt}".strip
        call_recording.transcription_vtt = vtt
        call_recording.create_speakers_from_transcription_vtt!
      end
    end

    if call_recording.changed?
      call_recording.save!
      call_recording.trigger_client_transcription_update
    end

    GenerateCallTitleJob.perform_async(call_recording.call.id)
    call_recording.generate_summary_sections
    call_recording.call.trigger_stale
    call_recording.trigger_stale
  end
end
