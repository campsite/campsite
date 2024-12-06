# frozen_string_literal: true

module Backfills
  class CallPeersUserIdBackfill
    def self.run(dry_run: true)
      peers = CallPeer.where(user_id: nil).joins(:organization_membership)

      count = if dry_run
        peers.count
      else
        peers.update_all("call_peers.user_id = organization_memberships.user_id")
      end

      "#{dry_run ? "Would have updated" : "Updated"} #{count} CallPeer #{"record".pluralize(count)}"
    end
  end
end
