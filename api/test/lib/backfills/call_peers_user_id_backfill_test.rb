# frozen_string_literal: true

require "test_helper"

module Backfills
  class CallPeersUserIdBackfillTest < ActiveSupport::TestCase
    setup do
      @member = create(:organization_membership)
      @call_peer_with_org_member = create(:call_peer, organization_membership: @member, user_id: nil)
      @call_peer_without_org_member = create(:call_peer, organization_membership: nil, user_id: nil)
    end

    describe ".run" do
      test "updates user_id for CallPeers with organization_memberships" do
        CallPeersUserIdBackfill.run(dry_run: false)

        assert_equal @member.user_id, @call_peer_with_org_member.reload.user_id
        assert_nil @call_peer_without_org_member.reload.user_id
      end

      test "dry run is a no-op" do
        CallPeersUserIdBackfill.run

        assert_nil @call_peer_with_org_member.reload.user_id
        assert_nil @call_peer_without_org_member.reload.user_id
      end
    end
  end
end
