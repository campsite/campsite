# frozen_string_literal: true

require "test_helper"

class AnalyticsTest < ActiveSupport::TestCase
  include Devise::Test::IntegrationHelpers

  setup do
    @user = create(:organization_membership).user
    @organization = @user.organizations.first
  end

  describe "analytics" do
    it "accepts an org slug and can call identify and track" do
      analytics = Analytics.new(user: @user, org_slug: @organization.slug, request: nil)

      assert_nothing_raised do
        analytics.track(event: "test", properties: { test: "test" })
      end
    end

    it "accepts a missing org slug and can call identify and track" do
      analytics = Analytics.new(user: @user, org_slug: "foo_bar", request: nil)

      assert_nothing_raised do
        analytics.track(event: "test", properties: { test: "test" })
      end
    end

    it "accepts a nil org slug and can call identify and track" do
      analytics = Analytics.new(user: @user, org_slug: nil, request: nil)

      assert_nothing_raised do
        analytics.track(event: "test", properties: { test: "test" })
      end
    end
  end
end
