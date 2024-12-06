# frozen_string_literal: true

require "test_helper"

module Backfills
  class CampsiteIntegrationBackfillTest < ActiveSupport::TestCase
    describe ".run" do
      setup do
        @org1 = create(:organization)

        @org2 = create(:organization)
        create(:integration, :slack, owner: @org2)

        @org3 = create(:organization)
        @org3.create_campsite_integration

        @org4 = create(:organization)
        @org4.create_campsite_integration
        create(:integration, :slack, owner: @org4)

        # author-less posts that should be assigned the campsite integration
        @post1 = create(:post, organization: @org1, member: nil)
        @post2 = create(:post, organization: @org2, member: nil)
      end

      it "dry run is a no-op" do
        CampsiteIntegrationBackfill.run

        assert_no_difference -> { Integration.count } do
          CampsiteIntegrationBackfill.run(dry_run: true)
        end
      end

      it "creates a campsite integration for all organizations that don't have one" do
        assert_not @org1.campsite_integration
        assert_not @org2.campsite_integration
        assert_not @post1.integration
        assert_not @post2.integration

        CampsiteIntegrationBackfill.run(dry_run: false)

        assert_predicate @org1.reload.campsite_integration, :present?
        assert_equal @org1.campsite_integration, @post1.reload.author

        assert_predicate @org2.reload.campsite_integration, :present?
        assert_equal @org2.campsite_integration, @post2.reload.author

        assert_equal Integration.where(provider: :campsite).count, Organization.count
      end
    end
  end
end
