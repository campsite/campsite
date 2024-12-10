# frozen_string_literal: true

require "test_helper"

module Admin
  module Features
    class OrganizationsControllerTest < ActionDispatch::IntegrationTest
      include Devise::Test::IntegrationHelpers

      setup do
        host! "admin.campsite.com"
        @staff = create(:user, :staff)
      end

      context "#create" do
        test "it enables a flag for an org" do
          org = create(:organization)
          feature_name = "my_cool_feature"
          assert_not Flipper.enabled?(feature_name, org)

          sign_in(@staff)
          post feature_organizations_path(feature_name, params: { slug: org.slug })

          assert_response :redirect
          assert_equal "Enabled #{feature_name} for #{org.slug}", flash[:notice]
          assert Flipper.enabled?(feature_name, org)

          audit_log = FlipperAuditLog.last!
          assert_equal org.name, audit_log.target_display_name
        end

        test "it returns an error when user not found" do
          sign_in(@staff)
          post feature_organizations_path("my_cool_feature", params: { slug: "not-a-real-org" })

          assert_response :redirect
          assert_equal "No organization found with that slug", flash[:alert]
        end
      end

      context "#destroy" do
        test "it disables a flag for an org" do
          org = create(:organization)
          feature_name = "my_cool_feature"
          Flipper.enable(feature_name, org)

          sign_in(@staff)
          delete feature_organization_path(feature_name, org)

          assert_response :redirect
          assert_equal "Disabled #{feature_name} for #{org.slug}", flash[:notice]
          assert_not Flipper.enabled?(feature_name, org)
        end

        test "it returns an error when org not found" do
          feature_name = "my_cool_feature"

          sign_in(@staff)
          delete feature_organization_path(feature_name, "foobar")

          assert_response :redirect
          assert_equal "Organization not found", flash[:alert]
        end
      end
    end
  end
end
