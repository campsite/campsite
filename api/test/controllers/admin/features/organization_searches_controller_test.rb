# frozen_string_literal: true

require "test_helper"

module Admin
  module Features
    class OrganizationSearchesControllerTest < ActionDispatch::IntegrationTest
      include Devise::Test::IntegrationHelpers

      setup do
        host! "admin.campsite.com"
        @staff = create(:user, :staff)
      end

      context "#show" do
        it "returns organizations with matching slugs" do
          create(:organization, slug: "acme-inc")
          create(:organization, slug: "bluth-company")

          sign_in(@staff)
          get feature_organization_search_path(
            "my_cool_feature",
            params: { q: "Acme" },
            xhr: true,
          )

          assert_response :ok
          assert_includes response.body, "acme-inc"
          assert_not_includes response.body, "bluth-company"
        end

        it "does not include organizations with the feature already enabled" do
          org = create(:organization)
          feature_name = "my_cool_feature"
          Flipper.enable(feature_name, org)

          sign_in(@staff)
          get feature_organization_search_path(
            feature_name,
            params: { q: org.slug },
            xhr: true,
          )

          assert_response :ok
          assert_not_includes response.body, org.slug
        end
      end
    end
  end
end
