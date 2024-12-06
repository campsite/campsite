# frozen_string_literal: true

require "test_helper"

module Admin
  module Features
    class RollbacksControllerTest < ActionDispatch::IntegrationTest
      include Devise::Test::IntegrationHelpers

      setup do
        host! "admin.campsite.com"
        @staff = create(:user, :staff)
      end

      context "#create" do
        test "it rolls back a feature from globally enabled to globally disabled" do
          feature_name = "my_cool_feature"

          Flipper.enable(feature_name)
          log = FlipperAuditLog.last!

          Flipper.disable(feature_name)
          assert_not_predicate Flipper.feature(feature_name), :enabled?

          sign_in(@staff)
          post feature_log_rollback_path(feature_name, log.id)

          assert_predicate Flipper.feature(feature_name), :enabled?
        end

        test "it rolls back a feature from globally disabled to globally enabled" do
          feature_name = "my_cool_feature"

          Flipper.disable(feature_name)
          log = FlipperAuditLog.last!

          Flipper.enable(feature_name)
          assert_predicate Flipper.feature(feature_name), :enabled?

          sign_in(@staff)
          post feature_log_rollback_path(feature_name, log.id)

          assert_not_predicate Flipper.feature(feature_name), :enabled?
        end

        test "it rolls back a feature to previously enabled actors" do
          feature_name = "my_cool_feature"
          previously_enabled_1 = create(:user)
          previously_enabled_2 = create(:user)
          previously_disabled_1 = create(:user)
          previously_disabled_2 = create(:user)

          Flipper.enable_actor(feature_name, previously_enabled_1)
          Flipper.enable_actor(feature_name, previously_enabled_2)
          Flipper.disable_actor(feature_name, previously_disabled_1)
          Flipper.disable_actor(feature_name, previously_disabled_2)
          log = FlipperAuditLog.last!

          Flipper.disable_actor(feature_name, previously_enabled_1)
          Flipper.disable_actor(feature_name, previously_enabled_2)
          Flipper.enable_actor(feature_name, previously_disabled_1)
          Flipper.disable_actor(feature_name, previously_disabled_2)

          sign_in(@staff)
          post feature_log_rollback_path(feature_name, log.id)

          assert Flipper.enabled?(feature_name, previously_enabled_1)
          assert Flipper.enabled?(feature_name, previously_enabled_2)
          assert_not Flipper.enabled?(feature_name, previously_disabled_1)
          assert_not Flipper.enabled?(feature_name, previously_disabled_2)
        end

        test "it rolls back a feature to previously enabled groups" do
          feature_name = "my_cool_feature"

          Flipper.enable_group(feature_name, :staff)
          Flipper.disable_group(feature_name, :logged_out)
          log = FlipperAuditLog.last!

          Flipper.disable_group(feature_name, :staff)
          Flipper.enable_group(feature_name, :logged_out)

          sign_in(@staff)
          post feature_log_rollback_path(feature_name, log.id)

          assert_equal [:staff], Flipper.feature(feature_name).enabled_groups.map(&:value)
        end

        test "it rolls back a feature to previously enabled percentage of time" do
          feature_name = "my_cool_feature"
          previously_enabled_percentage = 10

          Flipper.enable_percentage_of_time(feature_name, previously_enabled_percentage)
          log = FlipperAuditLog.last!

          Flipper.disable_percentage_of_time(feature_name)

          sign_in(@staff)
          post feature_log_rollback_path(feature_name, log.id)

          assert_equal previously_enabled_percentage, Flipper.feature(feature_name).percentage_of_time_value
        end

        test "it rolls back a feature to previously enabled percentage of actors" do
          feature_name = "my_cool_feature"
          previously_enabled_percentage = 10

          Flipper.enable_percentage_of_actors(feature_name, previously_enabled_percentage)
          log = FlipperAuditLog.last!

          Flipper.disable_percentage_of_actors(feature_name)

          sign_in(@staff)
          post feature_log_rollback_path(feature_name, log.id)

          assert_equal previously_enabled_percentage, Flipper.feature(feature_name).percentage_of_actors_value
        end
      end
    end
  end
end
