# frozen_string_literal: true

class CallRecordingSpeaker < ApplicationRecord
  belongs_to :call_recording
  belongs_to :call_peer
end
