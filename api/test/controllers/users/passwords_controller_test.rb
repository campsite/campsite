# frozen_string_literal: true

require "test_helper"
require "test_helpers/rack_attack_helper"

module Users
  class PasswordsControllerTest < ActionDispatch::IntegrationTest
    include RackAttackHelper

    setup do
      host! "auth.campsite.com"
      @email = "hermione@campsite.com"
    end

    context "#create" do
      test "allows a password reset request" do
        enable_rack_attack do
          2.times do
            Rack::Attack.cache.count("limit password reset requests per email:another@email.com", 1.minute)
          end

          post user_password_path, params: { user: { email: @email } }

          assert_response :found
        end
      end

      test "rate limits password reset requests" do
        enable_rack_attack do
          2.times do
            Rack::Attack.cache.count("limit password reset requests per email:#{@email}", 1.minute)
          end

          post user_password_path, params: { user: { email: @email } }

          assert_response :too_many_requests
        end
      end
    end
  end
end
