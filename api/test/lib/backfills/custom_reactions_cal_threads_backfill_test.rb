# frozen_string_literal: true

require "test_helper"

module Backfills
  class CustomReactionsCalThreadsTest < ActiveSupport::TestCase
    setup do
      @organization = create(:organization)
      @organization_membership = create(:organization_membership, organization: @organization)
    end

    describe ".run" do
      it "creates custom reactions with attribution to first organization membership" do
        create(:organization_membership, organization: @organization)

        Down.expects(:download).at_least_once.returns(stub(content_type: "image/gif"))
        S3_BUCKET.expects(:object).at_least_once.returns(stub(put: true))

        assert_difference -> { CustomReaction.count }, 94 do
          CustomReactionsCalThreadsBackfill.run(dry_run: false, org_slug: @organization.slug)
        end

        first_organization_membership = @organization.kept_memberships.first
        CustomReaction.all.each do |reaction|
          assert_equal first_organization_membership, reaction.creator
        end
      end

      it "creates custom reactions with attribution to peer if he exists" do
        user = create(:user, username: "peer")
        peer_organization_membership = create(:organization_membership, organization: @organization, user: user)

        Down.expects(:download).at_least_once.returns(stub(content_type: "image/gif"))
        S3_BUCKET.expects(:object).at_least_once.returns(stub(put: true))

        assert_difference -> { CustomReaction.count }, 94 do
          CustomReactionsCalThreadsBackfill.run(dry_run: false, org_slug: @organization.slug)
        end

        CustomReaction.all.each do |reaction|
          assert_equal peer_organization_membership, reaction.creator
        end
      end

      it "does not create custom reactions if they already exist" do
        Down.expects(:download).at_least_once.returns(stub(content_type: "image/gif"))
        S3_BUCKET.expects(:object).at_least_once.returns(stub(put: true))

        assert_difference -> { CustomReaction.count }, 94 do
          CustomReactionsCalThreadsBackfill.run(dry_run: false, org_slug: @organization.slug)
        end

        assert_no_difference -> { CustomReaction.count } do
          CustomReactionsCalThreadsBackfill.run(dry_run: false, org_slug: @organization.slug)
        end
      end

      it "dry run is a no-op" do
        Down.expects(:download).never
        S3_BUCKET.expects(:object).never

        assert_no_difference -> { CustomReaction.count } do
          CustomReactionsCalThreadsBackfill.run(dry_run: true, org_slug: @organization.slug)
        end
      end
    end
  end
end
