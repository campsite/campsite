# frozen_string_literal: true

require "test_helper"
require "test_helpers/oauth_test_helper"

module Api
  module V2
    class MembersControllerTest < ActionDispatch::IntegrationTest
      include OauthTestHelper
      include Devise::Test::IntegrationHelpers

      setup do
        @org = create(:organization)
        @members = create_list(:organization_membership, 3, :member, organization: @org)
        @org_oauth_app = create(:oauth_application, owner: @org, name: "Campbot")
        @org_app_token = create(:access_token, resource_owner: @org, application: @org_oauth_app)
        @user_app_token = create(:access_token, resource_owner: @members[0].user, application: @org_oauth_app)
      end

      context "#index" do
        it "returns a list of members" do
          list_members

          assert_response_gen_schema
          assert_equal 3, json_response["data"].length
          assert_equal @members.pluck(:public_id), json_response["data"].pluck("id")
        end

        it "applies pagination" do
          list_members(params: { limit: 1 })

          assert_response :success
          assert_equal 1, json_response["data"].length
          assert_not_nil json_response["next_cursor"]
          assert_nil json_response["prev_cursor"]
        end

        it "applies ordering" do
          list_members(params: { order: { by: "created_at", direction: "desc" } })

          assert_response :success
          assert_equal @members.pluck(:public_id).reverse, json_response["data"].pluck("id")
        end

        it "applies roles filter" do
          admin_member = create(:organization_membership, :admin, organization: @org)
          guest_member = create(:organization_membership, :guest, organization: @org)

          list_members(params: { roles: [Role::ADMIN_NAME, Role::GUEST_NAME].join(",") })

          assert_response :success
          assert_equal [admin_member.public_id, guest_member.public_id].sort, json_response["data"].pluck("id").sort
        end

        it "applies search" do
          member = create(:organization_membership, :member, organization: @org, user: create(:user, name: "Reed Marsh"))

          list_members(params: { q: "Reed Marsh" })

          assert_response :success
          assert_equal [member.public_id], json_response["data"].pluck("id")
        end

        it "works with a universal oauth app and an org token" do
          app = create(:oauth_application, :universal)
          token = app.access_tokens.create!(resource_owner: @org)

          list_members(headers: oauth_request_headers(token: token.plaintext_token))

          assert_response :success
          assert_equal @members.map(&:public_id), json_response["data"].pluck("id")
        end

        it "returns an error if the limit is too high" do
          list_members(params: { limit: 51 })

          assert_response :unprocessable_entity
          assert_equal "`limit` must be less than or equal to 50.", json_response["error"]["message"]
        end

        it "returns an error if the token is invalid" do
          list_members(headers: bearer_token_header("invalid_token"))
          assert_response :unauthorized
        end

        it "returns an error if no token is provided" do
          list_members(headers: {})
          assert_response :unauthorized
        end

        def list_members(params: {}, headers: oauth_request_headers(token: @org_app_token.plaintext_token))
          get(v2_members_path, params: params, headers: headers)
        end
      end
    end
  end
end
