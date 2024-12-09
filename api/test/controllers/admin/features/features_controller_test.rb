# frozen_string_literal: true

require "test_helper"

module Admin
  module Features
    class FeaturesControllerTest < ActionDispatch::IntegrationTest
      include Devise::Test::IntegrationHelpers
      include ERB::Util

      setup do
        host! "admin.campsite.com"
        @staff = create(:user, :staff)
      end

      context "#index" do
        test "it lists the flags" do
          feature_name = "my_cool_feature"
          Flipper.enable(feature_name)

          sign_in(@staff)
          get features_path

          assert_response :ok
          assert_includes response.body, feature_name
        end

        test "it 404s for a rando" do
          rando = create(:user)

          sign_in(rando)
          assert_raises ActionController::RoutingError do
            get features_path
          end
        end

        test "it redirects an unauthenticated user" do
          get features_path

          assert_response :redirect
        end
      end

      context "#create" do
        it "creates a new feature" do
          feature_name = "my_cool_feature"

          sign_in(@staff)
          post features_path(params: { name: feature_name })

          assert_response :redirect
          assert_includes response.redirect_url, feature_name
          assert_includes Flipper.features.map(&:name), feature_name
        end
      end

      context "#destroy" do
        it "deletes a feature" do
          feature_name = "my_cool_feature"
          Flipper.feature(feature_name).add

          sign_in(@staff)
          delete feature_path(feature_name)

          assert_response :redirect
          assert_not_includes Flipper.features.map(&:name), feature_name
        end
      end

      context "#show" do
        it "lists the users, organizations, and groups with the feature enabled" do
          user = create(:user)
          org = create(:organization)
          group_name = "staff"
          feature_name = "my_cool_feature"
          Flipper.enable(feature_name, user)
          Flipper.enable(feature_name, org)
          Flipper.enable_group(feature_name, group_name)

          sign_in(@staff)
          get feature_path(feature_name)

          assert_response :ok
          assert_includes response.body, user.email
          assert_includes response.body, h(org.name)
          assert_includes response.body, group_name
        end

        it "gracefully handles deleted actors" do
          user = create(:user)
          user_id = user.id
          org = create(:organization)
          org_id = org.id
          feature_name = "my_cool_feature"
          Flipper.enable(feature_name, user)
          Flipper.enable(feature_name, org)
          user.destroy!
          org.destroy!

          sign_in(@staff)
          get feature_path(feature_name)

          assert_response :ok
          assert_includes response.body, "User;#{user_id} (deleted)"
          assert_includes response.body, "Organization;#{org_id} (deleted)"
        end

        it "shows placeholders when no actors or groups enabled" do
          sign_in(@staff)
          get feature_path("my_cool_feature")

          assert_response :ok
          assert_includes response.body, "Not enabled for any users"
          assert_includes response.body, "Not enabled for any organizations"
          assert_includes response.body, "Not enabled for any groups"
        end
      end
    end
  end
end
