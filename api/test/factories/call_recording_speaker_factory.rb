# frozen_string_literal: true

FactoryBot.define do
  factory :call_recording_speaker do
    association :call_peer, factory: :call_peer
    name { call_peer.name }
    call_recording
  end
end
