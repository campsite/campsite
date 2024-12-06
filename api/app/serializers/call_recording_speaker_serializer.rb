# frozen_string_literal: true

class CallRecordingSpeakerSerializer < ApiSerializer
  api_field :name
  api_association :call_peer, blueprint: CallPeerSerializer
end
