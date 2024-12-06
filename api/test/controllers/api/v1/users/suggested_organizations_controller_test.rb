# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module Users
      class SuggestedOrganizationsControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        setup do
          @user = create(:user)
        end

        context "#index" do
          before do
            create(:organization, name: "harry", email_domain: "campsite.com")
            # the domain for user factories is example.com
            create(:organization, name: "ron", email_domain: "example.com")
            create(:organization, name: "hagrid", email_domain: "example.com")
          end

          test "returns a list of suggested orgs for a user" do
            sign_in @user
            get current_user_suggested_organizations_path

            assert_response :ok
            assert_response_gen_schema

            assert_equal 2, json_response.length
            expected_ids = @user.suggested_organizations.pluck(:public_id).sort
            assert_equal expected_ids, json_response.pluck("id").sort
          end

          test "return 401 for an unauthenticated user" do
            get current_user_suggested_organizations_path
            assert_response :unauthorized
          end
        end
      end
    end
  end
end
