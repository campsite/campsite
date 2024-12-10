# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module Organizations
      class FeaturesControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        setup do
          @organization = create(:organization, plan_name: Plan::FREE_NAME)
          @feature_name = "test_feature"
          Flipper.enable(@feature_name, @organization)
        end

        context "#index" do
          test "returns empty array when no flags enabled" do
            Flipper.disable(@feature_name, @organization)
            user = create(:organization_membership, organization: @organization).user

            sign_in(user)
            get organization_features_path(@organization.slug)

            assert_response :ok
            assert_response_gen_schema
            assert_equal [], json_response["features"]
          end

          test "returns org features to an org admin" do
            user = create(:organization_membership, organization: @organization).user

            sign_in(user)

            Organization.stub_const(:FEATURE_FLAGS, [@feature_name, "other_feature"]) do
              get organization_features_path(@organization.slug)
            end

            assert_response :ok
            assert_equal [@feature_name], json_response["features"]
          end

          test "returns org features to an org member" do
            user = create(:organization_membership, :member, organization: @organization).user

            sign_in(user)

            Organization.stub_const(:FEATURE_FLAGS, [@feature_name, "other_feature"]) do
              get organization_features_path(@organization.slug)
            end

            assert_response :ok
            assert_equal [@feature_name], json_response["features"]
          end

          test "returns org features to a user not in the org" do
            user = create(:user)

            sign_in(user)

            Organization.stub_const(:FEATURE_FLAGS, [@feature_name, "other_feature"]) do
              get organization_features_path(@organization.slug)
            end

            assert_response :ok
            assert_equal [@feature_name], json_response["features"]
          end

          test "returns org features to a logged-out user" do
            Organization.stub_const(:FEATURE_FLAGS, [@feature_name, "other_feature"]) do
              get organization_features_path(@organization.slug)
            end

            assert_response :ok
            assert_equal [@feature_name], json_response["features"]
          end

          test "returns 404 when org doesn't exist" do
            get organization_features_path("not-an-org-slug")

            assert_response :not_found
          end
        end
      end
    end
  end
end
