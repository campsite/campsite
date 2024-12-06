# frozen_string_literal: true

require "test_helper"

require "test_helpers/rack_attack_helper"

module Api
  module V1
    module OrganizationMemberships
      class StatusesControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        include RackAttackHelper

        setup do
          @organization = create(:organization)
          @member = create(:organization_membership, organization: @organization)
        end

        context "#index" do
          test "returns the last 5 statuses" do
            sign_in @member.user

            @member.statuses.create!(emoji: "👍", message: "bad", expires_at: 30.minutes.ago)
            @member.statuses.create!(emoji: "👍", message: "good", expires_at: 30.minutes.ago)
            @member.statuses.create!(emoji: "👍", message: "better", expires_at: 30.minutes.ago)
            @member.statuses.create!(emoji: "👍", message: "great", expires_at: 30.minutes.ago)
            @member.statuses.create!(emoji: "👍", message: "amazing", expires_at: 30.minutes.ago)
            @member.statuses.create!(emoji: "👍", message: "fantastic", expires_at: 30.minutes.ago)

            get organization_membership_statuses_path(@organization.slug)

            assert_response :ok
            assert_equal 5, response.parsed_body.count
            assert_equal "fantastic", response.parsed_body[0]["message"]
            assert_equal "amazing", response.parsed_body[1]["message"]
            assert_equal "great", response.parsed_body[2]["message"]
            assert_equal "better", response.parsed_body[3]["message"]
            assert_equal "good", response.parsed_body[4]["message"]
          end

          test "does not return the active status" do
            sign_in @member.user

            @member.statuses.create!(emoji: "👍", message: "good", expires_at: 30.minutes.from_now)

            get organization_membership_statuses_path(@organization.slug)

            assert_response :ok
            assert_equal 0, response.parsed_body.count
          end

          test "does not return duplicate messages" do
            sign_in @member.user

            @member.statuses.create!(emoji: "👍", message: "good", expires_at: 30.minutes.ago)
            @member.statuses.create!(emoji: "👍", message: "good", expires_at: 30.minutes.ago)
            @member.statuses.create!(emoji: "👍", message: "good", expires_at: 30.minutes.ago)
            @member.statuses.create!(emoji: "👍", message: "good", expires_at: 30.minutes.ago)
            @member.statuses.create!(emoji: "👍", message: "good", expires_at: 30.minutes.ago)
            @member.statuses.create!(emoji: "👍", message: "good", expires_at: 30.minutes.ago)

            get organization_membership_statuses_path(@organization.slug)

            assert_response :ok
            assert_equal 1, response.parsed_body.count
            assert_equal "good", response.parsed_body[0]["message"]
          end
        end

        context "#create" do
          test "return 403 for a random user" do
            sign_in create(:user)
            post organization_membership_statuses_path(@organization.slug, { emoji: "👍", message: "good", expiration_setting: "30m" })
            assert_response :forbidden
          end

          test "return 401 for an unauthenticated user" do
            post organization_membership_statuses_path(@organization.slug, { emoji: "👍", message: "good", expiration_setting: "30m" })
            assert_response :unauthorized
          end

          test "works for an org member" do
            Timecop.freeze do
              sign_in @member.user

              UpdateStatusJob.expects(:perform_async).with(@member.id)

              post organization_membership_statuses_path(@organization.slug, { emoji: "👍", message: "good", expiration_setting: "30m" })

              assert_response :created

              assert_equal 1, @member.reload.statuses.count
              assert_equal "👍", @member.latest_status.emoji
              assert_equal "good", @member.latest_status.message
              assert_in_delta 30.minutes.from_now.to_i, @member.latest_status.expires_at.to_i, 2.seconds
              assert_not_predicate @member.user.reload, :notifications_paused?
            end
          end

          test "fails if the user already has a status" do
            sign_in @member.user

            @member.statuses.create!(emoji: "👍", message: "good", expires_at: 30.minutes.from_now)

            post organization_membership_statuses_path(@organization.slug, { emoji: "👍", message: "good", expiration_setting: "30m" })

            assert_response :unprocessable_entity
            assert_equal 1, @member.statuses.count
          end

          test "accepts an expires_at parameter" do
            Timecop.freeze do
              sign_in @member.user

              UpdateStatusJob.expects(:perform_async).with(@member.id)

              post organization_membership_statuses_path(@organization.slug, { emoji: "👍", message: "good", expiration_setting: "30m", expires_at: 10.minutes.from_now })

              assert_response :created

              assert_equal 1, @member.reload.statuses.count
              assert_equal "👍", @member.latest_status.emoji
              assert_equal "good", @member.latest_status.message
              assert_in_delta 10.minutes.from_now.to_i, @member.latest_status.expires_at.to_i, 2.seconds
            end
          end

          test "accepts a custom expiration time" do
            Timecop.freeze do
              sign_in @member.user

              UpdateStatusJob.expects(:perform_async).with(@member.id)

              post organization_membership_statuses_path(@organization.slug, { emoji: "👍", message: "good", expiration_setting: "custom", expires_at: 2.weeks.from_now.iso8601 })

              assert_response :created

              assert_equal 1, @member.reload.statuses.count
              assert_equal "👍", @member.latest_status.emoji
              assert_equal "good", @member.latest_status.message
              assert_in_delta 2.weeks.from_now.to_i, @member.latest_status.expires_at.to_i, 2.seconds
            end
          end

          test "pauses notifications" do
            Timecop.freeze do
              sign_in @member.user
              post organization_membership_statuses_path(@organization.slug, { emoji: "👍", message: "good", expiration_setting: "30m", pause_notifications: "true" })

              assert_response :created
              assert_in_delta 30.minutes.from_now, @member.user.reload.notification_pause_expires_at
            end
          end

          test "newly created status without notification pause does not cancel existing pause" do
            Timecop.freeze do
              @member.user.update!(notification_pause_expires_at: 1.day.from_now)

              sign_in @member.user
              post organization_membership_statuses_path(@organization.slug, { emoji: "👍", message: "good", expiration_setting: "30m" })

              assert_response :created
              assert_in_delta 1.day.from_now, @member.user.reload.notification_pause_expires_at
            end
          end
        end

        context "#update" do
          test "fails if the user does not have an active status" do
            sign_in @member.user

            put organization_membership_statuses_path(@organization.slug, { emoji: "👍", message: "good", expiration_setting: "30m" })

            assert_response :not_found
          end

          test "updates the user's existing status" do
            Timecop.freeze do
              sign_in @member.user

              @member.statuses.create!(emoji: "👍", message: "good", expires_at: 30.minutes.from_now)

              UpdateStatusJob.expects(:perform_async).with(@member.id)

              put organization_membership_statuses_path(@organization.slug, { emoji: "🥰", message: "better", expiration_setting: "1h" })

              assert_response :ok
              assert_equal "🥰", @member.latest_status.emoji
              assert_equal "better", @member.latest_status.message
              assert_in_delta 1.hour.from_now.to_i, @member.latest_status.expires_at.to_i, 2.seconds
            end
          end

          test "changing pause notifications from false to true pauses notifications" do
            Timecop.freeze do
              @member.statuses.create!(emoji: "👍", message: "good", expires_at: 30.minutes.from_now)

              sign_in @member.user
              put organization_membership_statuses_path(@organization.slug, { emoji: "🥰", message: "better", expiration_setting: "1h", pause_notifications: "true" })

              assert_response :ok
              assert_in_delta 1.hour.from_now, @member.user.reload.notification_pause_expires_at
            end
          end

          test "keeping pause notifications true repauses notifications" do
            Timecop.freeze do
              @member.statuses.create!(emoji: "👍", message: "good", expiration_setting: "30m", expires_at: 30.minutes.from_now, pause_notifications: true)
              @member.user.update!(notification_pause_expires_at: nil)

              sign_in @member.user
              put organization_membership_statuses_path(@organization.slug, { emoji: "👍", message: "good", expiration_setting: "30m", pause_notifications: "true" })

              assert_response :ok
              assert_in_delta 30.minutes.from_now, @member.user.reload.notification_pause_expires_at, 2.seconds
            end
          end

          test "changing pause notifications from true to false unpauses notifications" do
            Timecop.freeze do
              @member.user.update!(notification_pause_expires_at: 1.day.from_now)
              @member.statuses.create!(emoji: "👍", message: "good", expires_at: 30.minutes.from_now, pause_notifications: true)

              sign_in @member.user
              put organization_membership_statuses_path(@organization.slug, { emoji: "🥰", message: "better", expiration_setting: "1h" })

              assert_response :ok
              assert_nil @member.user.reload.notification_pause_expires_at
            end
          end

          test "keeping pause notifications false does not unpause notifications" do
            Timecop.freeze do
              @member.user.update!(notification_pause_expires_at: 1.day.from_now)
              @member.statuses.create!(emoji: "👍", message: "good", expires_at: 30.minutes.from_now)

              sign_in @member.user
              put organization_membership_statuses_path(@organization.slug, { emoji: "🥰", message: "better", expiration_setting: "1h" })

              assert_response :ok
              assert_in_delta 1.day.from_now, @member.user.reload.notification_pause_expires_at, 2.seconds
            end
          end
        end

        context "#destroy" do
          test "fails if the user does not have an active status" do
            sign_in @member.user

            delete organization_membership_statuses_path(@organization.slug)

            assert_response :not_found
          end

          test "deletes the user's existing status" do
            sign_in @member.user

            @member.statuses.create!(emoji: "👍", message: "good", expires_at: 30.minutes.from_now)

            UpdateStatusJob.expects(:perform_async).with(@member.id)

            delete organization_membership_statuses_path(@organization.slug)

            assert_response :no_content
            assert @member.latest_status.expired?
            assert_equal 1, @member.statuses.count
          end
        end
      end
    end
  end
end
