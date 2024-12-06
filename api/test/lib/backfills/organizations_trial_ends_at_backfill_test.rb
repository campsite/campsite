# frozen_string_literal: true

require "test_helper"

module Backfills
  class OrganizationsTrialEndsAtBackfillTest < ActiveSupport::TestCase
    setup do
      @organization_missing_trial_ends_at = create(:organization, trial_ends_at: nil)
      @organization_with_trial_ends_at = create(:organization, trial_ends_at: 1.day.from_now)
      @paid_organization = create(:organization, trial_ends_at: nil, plan_name: Plan::PRO_NAME)
    end

    context ".run" do
      test "updates free organizations missing trial_ends_at" do
        Timecop.freeze do
          OrganizationsTrialEndsAtBackfill.run(dry_run: false)

          assert_in_delta @organization_missing_trial_ends_at.created_at + 30.days, @organization_missing_trial_ends_at.reload.trial_ends_at, 2.seconds
          assert_in_delta 1.day.from_now, @organization_with_trial_ends_at.reload.trial_ends_at, 2.seconds
          assert_nil @paid_organization.reload.trial_ends_at
        end
      end

      test "dry run is a no-op" do
        Timecop.freeze do
          OrganizationsTrialEndsAtBackfill.run

          assert_nil @organization_missing_trial_ends_at.reload.trial_ends_at
          assert_in_delta 1.day.from_now, @organization_with_trial_ends_at.reload.trial_ends_at, 2.seconds
          assert_nil @paid_organization.reload.trial_ends_at
        end
      end
    end
  end
end
