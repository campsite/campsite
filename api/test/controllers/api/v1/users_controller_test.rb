# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    class UsersControllerTest < ActionDispatch::IntegrationTest
      include Devise::Test::IntegrationHelpers

      setup do
        @user = create(:user, name: "Foo Bar")
        @member = create(:organization_membership, user: @user)
        @organization = @user.organizations.first
      end

      context "#me" do
        test "returns current user" do
          sign_in @user
          get current_user_path

          assert_response :ok
          assert_response_gen_schema

          assert_equal @user.public_id, json_response["id"]
          assert json_response["avatar_url"]
          assert_equal @user.email, json_response["email"]
          assert_equal @user.confirmed?, json_response["email_confirmed"]
          assert_equal @user.username, json_response["username"]
          assert_nil json_response["unconfirmed_email"]
          assert_not json_response["staff"]
          assert_predicate json_response["features"], :none?
          assert json_response["logged_in"]
          assert_equal false, json_response["on_call"]
          assert_equal false, json_response["notifications_paused"]
        end

        test "includes features enabled for the current user" do
          enabled_feature = "my_new_feature"
          Flipper.enable(enabled_feature, @user)

          User.stub_const(:FRONTEND_FEATURES, [enabled_feature, "other_feature"]) do
            sign_in @user
            get current_user_path
          end

          assert_response :ok
          assert_equal [enabled_feature], json_response["features"]
        end

        test "includes theme preference" do
          @user.preferences.create!(key: :theme, value: "dark")

          sign_in @user
          get current_user_path

          assert_response :ok
          assert_response_gen_schema
          assert_equal "dark", json_response.dig("preferences", "theme")
        end

        test "includes layout preference" do
          @user.preferences.create!(key: :layout, value: "grid")

          sign_in @user
          get current_user_path

          assert_response :ok
          assert_response_gen_schema
          assert_equal "grid", json_response.dig("preferences", "layout")
        end

        test "indicates staff status" do
          staff = create(:user, :staff)

          sign_in staff
          get current_user_path

          assert_response :ok
          assert_response_gen_schema
          assert json_response["staff"]
        end

        test "returns null user when logged out" do
          get current_user_path

          assert_response :ok
          assert_not json_response["logged_in"]
        end

        test "indicates when the user is on a call" do
          create(:call_peer, :active, organization_membership: @member)

          sign_in(@user)
          get current_user_path

          assert_response :ok
          assert_equal true, json_response["on_call"]
        end

        test "includes when user has notifications paused" do
          @user.update!(notification_pause_expires_at: 1.day.from_now)

          sign_in(@user)
          get current_user_path

          assert_response :ok
          assert_equal true, json_response["notifications_paused"]
        end
      end

      context "#update" do
        context "email" do
          test "updates the user email" do
            sign_in @user
            put current_user_path, params: { email: "new@example.com" }

            assert_response :ok
            assert_response_gen_schema
            assert_equal "new@example.com", json_response["unconfirmed_email"]
          end

          test "returns an error for invalid email" do
            sign_in @user
            put current_user_path, params: { email: "new" }

            assert_response :unprocessable_entity
            assert_equal "Email is invalid", json_response["message"]
          end

          test "returns an error for a managed user" do
            @user.update(omniauth_provider: "google_oauth2", omniauth_uid: "123456789")
            assert_predicate @user, :managed?

            sign_in @user
            put current_user_path, params: { email: "new" }

            assert_response :unprocessable_entity
            assert_match(/Your account is managed through google sign in/, json_response["message"])
          end

          test "queues a timezone job when not set" do
            assert_nil @user.preferred_timezone
            sign_in @user
            get current_user_path, headers: { "X-Campsite-Tz" => "America/New_York" }
            assert_enqueued_sidekiq_job SetUserPreferredTimezoneJob, args: [@user.id, "America/New_York"]
          end

          test "does not queue a timezone job when set" do
            @user.update!(preferred_timezone: "America/New_York")
            assert_not_nil @user.preferred_timezone
            sign_in @user
            get current_user_path, headers: { "X-Campsite-Tz" => "America/New_York" }
            assert_enqueued_sidekiq_jobs 0, only: SetUserPreferredTimezoneJob
          end

          test "does not queue a timezone job when no header" do
            assert_nil @user.preferred_timezone
            sign_in @user
            get current_user_path
            assert_enqueued_sidekiq_jobs 0, only: SetUserPreferredTimezoneJob
          end
        end

        context "username" do
          test "updates the user username" do
            sign_in @user
            put current_user_path, params: { username: "boom" }

            assert_response :ok
            assert_response_gen_schema
            assert_equal "boom", json_response["username"]
          end

          test "returns an error for invalid username" do
            sign_in @user
            put current_user_path, params: { username: "-b-" }

            assert_response :unprocessable_entity
            assert_equal "Username can only contain alphanumeric characters and underscores.", json_response["message"]
          end
        end

        context "name" do
          test "updates the user's name" do
            sign_in @user
            put current_user_path, params: { name: "Ron Hagrid" }

            assert_response :ok
            assert_response_gen_schema
            assert_equal "Ron Hagrid", json_response["display_name"]
          end
        end

        context "avatar_path" do
          test "updates the avatar_path" do
            sign_in @user
            put current_user_path, params: { avatar_path: "/path/to/image.png" }

            assert_response :ok
            assert_response_gen_schema
            assert_match("/path/to/image.png", json_response["avatar_url"])
          end

          test "removes the avatar_path if blank" do
            @user.update!(avatar_path: "/path/to/image.png")

            sign_in @user
            put current_user_path, params: { avatar_path: nil }

            assert_response :ok
            assert_response_gen_schema
            assert_includes json_response["avatar_url"], "F.png"
          end
        end

        context "cover_photo_path" do
          test "updates the cover_photo_path" do
            sign_in @user
            put current_user_path, params: { cover_photo_path: "/path/to/image.png" }

            assert_response :ok
            assert_response_gen_schema
            assert_match("/path/to/image.png", json_response["cover_photo_url"])
          end

          test "removes the cover_photo_path if blank" do
            @user.update!(cover_photo_path: "/path/to/image.png")

            sign_in @user
            put current_user_path, params: { cover_photo_path: nil }

            assert_response :ok
            assert_response_gen_schema
            assert_nil json_response["cover_photo_url"]
          end
        end

        context "password" do
          test "updates the user password" do
            new_password = "CampsiteDesign!"

            sign_in @user
            put current_user_path, params: { current_password: @user.password, password: new_password, password_confirmation: new_password }

            assert_response :ok
            assert_response_gen_schema

            assert @user.valid_password?(new_password)
          end

          test "returns an error for invalid current password" do
            @user.update!(avatar_path: "/path/to/image.png")

            sign_in @user
            put current_user_path, params: { current_password: "invalid", password: "new_password", password_confirmation: "new_password" }

            assert_response :unprocessable_entity
            assert_equal "Current password is invalid", json_response["message"]
          end

          test "returns an error for a managed user" do
            new_password = "CampsiteDesign!"
            @user.update(omniauth_provider: "google_oauth2", omniauth_uid: "123456789")
            assert_predicate @user, :managed?

            sign_in @user
            put current_user_path, params: { current_password: @user.password, password: new_password, password_confirmation: new_password }

            assert_response :unprocessable_entity
            assert_match(/Your account is managed through google sign in/, json_response["message"])
          end
        end

        test("query count") do
          sign_in @user

          assert_query_count 4 do
            get current_user_path
          end
        end
      end

      context "#send_email_confirmation" do
        test "resends an email confirmation" do
          @user.update!(confirmed_at: nil)
          User.any_instance.expects(:send_confirmation_instructions)

          sign_in @user
          post send_user_confirmation_instructions_path

          assert_response :no_content
        end

        test "does not send the confirmation email for a confirmed user" do
          User.any_instance.expects(:send_confirmation_instructions).never
          assert_predicate @user, :confirmed?

          sign_in @user
          post send_user_confirmation_instructions_path

          assert_response :no_content
        end

        test "return 401 for an unauthenticated user" do
          post send_user_confirmation_instructions_path
          assert_response :unauthorized
        end
      end

      context "#onboard" do
        test "updates onboard_at for a user" do
          @user.update!(onboarded_at: nil)

          sign_in @user
          put onboard_current_user_path

          assert_response :ok
          assert_predicate @user, :onboarded?
        end

        test "does not update an already onboarded user" do
          now = Time.current
          @user.update!(onboarded_at: now)

          assert_no_difference -> { @user.onboarded_at } do
            sign_in @user
            put onboard_current_user_path

            assert_response :ok
          end
        end

        test "return 401 for an unauthenticated user" do
          put onboard_current_user_path
          assert_response :unauthorized
        end
      end

      context "#avatar_presigned_fields" do
        test "returns presigned fields for a user" do
          sign_in @user
          get user_avatar_presigned_fields_path, params: { mime_type: "image/png" }

          assert_response :ok
          assert_response_gen_schema
        end

        test "return 401 for an unauthenticated user" do
          get user_avatar_presigned_fields_path, params: { mime_type: "image/png" }
          assert_response :unauthorized
        end
      end

      context "#cover_photo_presigned_fields" do
        test "returns presigned fields for a user" do
          sign_in @user
          get user_cover_photo_presigned_fields_path, params: { mime_type: "image/png" }

          assert_response :ok
          assert_response_gen_schema
        end

        test "return 401 for an unauthenticated user" do
          get user_cover_photo_presigned_fields_path, params: { mime_type: "image/png" }
          assert_response :unauthorized
        end
      end
    end
  end
end
