# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    class InvitationUrlsControllerTest < ActionDispatch::IntegrationTest
      include Devise::Test::IntegrationHelpers

      setup do
        @organization = create(:organization)
        @member = create(:organization_membership, organization: @organization)
        @user = @member.user
      end

      context "#show" do
        test "org member can see invitation URL" do
          sign_in @user

          assert_query_count 3 do
            get organization_invitation_url_path(@organization.slug)
          end

          assert_response :ok
          assert_response_gen_schema
          assert_equal "http://app.campsite.test:3000/join/#{@organization.invite_token}", json_response["invitation_url"]
        end

        test "guest can't see invitation URL" do
          guest_member = create(:organization_membership, :guest, organization: @organization)

          sign_in guest_member.user
          get organization_invitation_url_path(@organization.slug)

          assert_response :forbidden
        end

        test "return 403 for a random user" do
          sign_in create(:user)
          get organization_invitation_url_path(@organization.slug)

          assert_response :forbidden
        end

        test "return 401 for an unauthenticated user" do
          get organization_invitation_url_path(@organization.slug)

          assert_response :unauthorized
        end
      end
    end
  end
end
