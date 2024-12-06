# frozen_string_literal: true

module HmsEvents
  class HandleSessionCloseSuccessJob < BaseJob
    sidekiq_options queue: "default", retry: 3

    def perform(payload)
      event = SessionCloseSuccessEvent.new(JSON.parse(payload))
      call = Call.create_or_find_by_hms_event!(event)

      call.update!(stopped_at: Time.zone.parse(event.session_stopped_at))

      call.peers.each do |peer|
        next if peer.left_at

        peer.update!(left_at: Time.zone.parse(event.session_stopped_at))
        peer.trigger_current_user_stale
      end

      if call.peers.count < 2 && call.recordings.none? && call.duration_in_seconds < 30
        call.messages.discard_all
      end

      call.trigger_stale
      call.room.kept_invitations.discard_all
    end
  end
end
