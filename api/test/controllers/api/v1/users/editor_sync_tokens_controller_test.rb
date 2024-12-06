# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module Users
      class EditorSyncTokensControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        context "#create" do
          setup do
            @user = create(:user)
          end

          test "returns a token" do
            sign_in @user

            assert_query_count 13 do
              post current_user_editor_sync_tokens_path
            end

            assert_response :created
            assert_response_gen_schema
            assert_predicate json_response["token"], :present?
          end

          test "does not return a token to logged-out user" do
            post current_user_editor_sync_tokens_path

            assert_response :unauthorized
          end
        end
      end
    end
  end
end
