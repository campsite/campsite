# frozen_string_literal: true

require "test_helper"

module Admin
  module Features
    class GroupsControllerTest < ActionDispatch::IntegrationTest
      include Devise::Test::IntegrationHelpers

      setup do
        host! "admin.campsite.com"
        @staff = create(:user, :staff)
      end

      context "#create" do
        test "it enables a flag for a group" do
          feature_name = "my_cool_feature"
          assert_not_includes Flipper[feature_name].enabled_groups.map(&:name), :staff

          sign_in(@staff)
          post feature_groups_path(feature_name, params: { name: "staff" })

          assert_response :redirect
          assert_equal "Enabled #{feature_name} for staff", flash[:notice]
          assert_includes Flipper[feature_name].enabled_groups.map(&:name), :staff
        end
      end

      context "#destroy" do
        test "it disables a flag for a group" do
          feature_name = "my_cool_feature"
          Flipper.enable_group(feature_name, :staff)

          sign_in(@staff)
          delete feature_group_path(feature_name, "staff")

          assert_response :redirect
          assert_equal "Disabled #{feature_name} for staff", flash[:notice]
          assert_not_includes Flipper[feature_name].enabled_groups.map(&:name), :staff
        end
      end
    end
  end
end
