# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module Users
      class SessionsControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        setup do
          @user = create(:user)
        end

        context "#destroy" do
          test "signs out a user" do
            sign_in @user

            delete sign_out_current_user_path
            assert_response :ok

            get current_user_path
            assert_response :ok
            assert_not json_response["logged_out"]
          end
        end
      end
    end
  end
end
