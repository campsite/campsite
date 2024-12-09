# frozen_string_literal: true

require "test_helper"

module Admin
  module Features
    class EnablementsControllerTest < ActionDispatch::IntegrationTest
      include Devise::Test::IntegrationHelpers

      setup do
        host! "admin.campsite.com"
        @staff = create(:user, :staff)
      end

      context "#create" do
        test "it globally enables the feature" do
          feature_name = "my_cool_feature"
          assert_not_predicate Flipper.feature(feature_name), :enabled?

          sign_in(@staff)
          post feature_enablement_path(feature_name)

          assert_predicate Flipper.feature(feature_name), :enabled?
        end
      end

      context "#destroy" do
        test "it globally disables the feature" do
          feature_name = "my_cool_feature"
          Flipper.enable(feature_name)
          assert_predicate Flipper.feature(feature_name), :enabled?

          sign_in(@staff)
          delete feature_enablement_path(feature_name)

          assert_not_predicate Flipper.feature(feature_name), :enabled?
        end
      end
    end
  end
end
