# frozen_string_literal: true

require "streamio-ffmpeg"

module Backfills
  class CallRecordingSpeakersCallPeerBackfill
    def self.run(dry_run: true)
      speakers = CallRecordingSpeaker
        .joins(call_recording: :call)
        .joins(
          <<~SQL.squish,
            JOIN call_peers ON
              call_peers.organization_membership_id = call_recording_speakers.organization_membership_id
              AND call_peers.call_id = calls.id
          SQL
        )
        .where(call_peer_id: nil)

      count = if dry_run
        speakers.count
      else
        speakers.update_all("call_peer_id = call_peers.id")
      end

      "#{dry_run ? "Would have updated" : "Updated"} #{count} CallRecordingSpeaker #{"record".pluralize(count)}"
    end
  end
end
