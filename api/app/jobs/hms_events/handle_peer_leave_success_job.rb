# frozen_string_literal: true

module HmsEvents
  class HandlePeerLeaveSuccessJob < BaseJob
    sidekiq_options queue: "default", retry: 3

    def perform(payload)
      event = PeerLeaveSuccessEvent.new(JSON.parse(payload))
      peer = CallPeer.create_or_find_by_hms_event!(event)

      peer.update!(left_at: event.left_at)
      peer.trigger_current_user_stale

      call = peer.call
      call.trigger_stale
      call.room.trigger_stale
      StopCallRecordingJob.perform_async(call.id) if call.active_peers.none?
    end
  end
end
