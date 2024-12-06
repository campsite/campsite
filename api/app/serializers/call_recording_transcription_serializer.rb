# frozen_string_literal: true

class CallRecordingTranscriptionSerializer < ApiSerializer
  api_field :transcription_vtt, name: :vtt, nullable: true
  api_association :speakers, blueprint: CallRecordingSpeakerSerializer, is_array: true
end
