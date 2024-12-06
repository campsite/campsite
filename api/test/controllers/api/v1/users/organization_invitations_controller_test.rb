# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module Users
      class OrganizationInvitationsControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        setup do
          @user = create(:user)
        end

        context "#index" do
          before do
            create(:organization_invitation, email: @user.email)
            create(:organization_invitation, email: @user.email)
          end

          test "returns paginated orgs for a user" do
            sign_in @user
            get current_user_organization_invitations_path

            assert_response :ok
            assert_response_gen_schema

            assert_equal 2, json_response.length
            expected_ids = OrganizationInvitation.where(email: @user.email).pluck(:public_id).sort
            assert_equal expected_ids, json_response.pluck("id").sort
            assert_not_empty json_response.pluck("token")
          end

          test "return 401 for an unauthenticated user" do
            get current_user_organization_invitations_path
            assert_response :unauthorized
          end
        end
      end
    end
  end
end
