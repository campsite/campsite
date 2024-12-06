# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module Integrations
      module CalDotCom
        class IntegrationsControllerTest < ActionDispatch::IntegrationTest
          include Devise::Test::IntegrationHelpers

          setup do
            @member = create(:organization_membership)
            @user = @member.user
          end

          describe "#show" do
            test "returns the user's Cal.com organization from the first organization membership" do
              sign_in @user
              get cal_dot_com_integration_path

              assert_response :ok
              assert_response_gen_schema
              assert_equal @member.organization.public_id, json_response.dig("organization", "id")
            end

            test "returns the user's Cal.com organization from billing email domain" do
              matching_org = create(:organization, billing_email: "billing@#{@user.email_domain}")
              create(:organization_membership, user: @user, organization: matching_org)

              sign_in @user
              get cal_dot_com_integration_path

              assert_response :ok
              assert_response_gen_schema
              assert_equal matching_org.public_id, json_response.dig("organization", "id")
            end

            test "returns the user's Cal.com organization from Preference" do
              preference_org = create(:organization_membership, user: @user).organization
              @user.find_or_initialize_preference(:cal_dot_com_organization_id).update!(value: preference_org.id)

              sign_in @user
              get cal_dot_com_integration_path

              assert_response :ok
              assert_response_gen_schema
              assert_equal preference_org.public_id, json_response.dig("organization", "id")
            end

            test "returns installed true when user has access token" do
              create(:access_token, :cal_dot_com, resource_owner: @user)

              sign_in @user
              get cal_dot_com_integration_path

              assert_response :ok
              assert_response_gen_schema
              assert_equal true, json_response["installed"]
            end

            test "returns installed false when user has access token" do
              sign_in @user
              get cal_dot_com_integration_path

              assert_response :ok
              assert_response_gen_schema
              assert_equal false, json_response["installed"]
            end

            test "returns unauthorized if the user is not signed in" do
              get cal_dot_com_integration_path
              assert_response :unauthorized
            end
          end
        end
      end
    end
  end
end
