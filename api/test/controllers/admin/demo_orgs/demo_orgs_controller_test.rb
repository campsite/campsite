# frozen_string_literal: true

require "test_helper"

module Admin
  module DemoOrgs
    class DemoOrgsControllerTest < ActionDispatch::IntegrationTest
      include Devise::Test::IntegrationHelpers

      setup do
        host! "admin.campsite.com"
        @staff = create(:user, :staff)
      end

      context "#index" do
        test "it lists the demo orgs" do
          sign_in(@staff)
          get demo_orgs_path

          assert_response :ok
          assert_includes response.body, "Demo orgs"
        end
      end

      context "#create" do
        test "it creates a new demo org" do
          sign_in(@staff)
          post demo_orgs_path(params: { slug: "new-demo-org" })

          assert_response :redirect
          assert_equal "Created Frontier Forest instance. Content is created asynchronously and will appear in the new instance shortly.", flash[:notice]
          assert_predicate Organization.find_by(slug: "new-demo-org"), :demo?
        end
      end
    end
  end
end
