# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    class ResourceMentionsControllerTest < ActionDispatch::IntegrationTest
      include Devise::Test::IntegrationHelpers

      context "#show" do
        setup do
          @member = create(:organization_membership)
          @organization = @member.organization
        end

        test "fetches a post successfully" do
          post = create(:post, organization: @organization)

          sign_in @member.user
          get organization_resource_mentions_path(@organization.slug, params: { url: post.url })

          assert_response :ok
          assert_response_gen_schema

          assert_equal post.url, json_response["id"]
          assert_not_nil json_response["post"]
          assert_nil json_response["call"]
          assert_nil json_response["note"]
        end

        test "fetches a call successfully" do
          call = create(:call, room: create(:call_room, organization: @organization))
          create(:call_peer, call: call, organization_membership: @member)

          sign_in @member.user
          get organization_resource_mentions_path(@organization.slug, params: { url: call.url })

          assert_response :ok
          assert_response_gen_schema

          assert_equal call.url, json_response["id"]
          assert_not_nil json_response["call"]
          assert_nil json_response["post"]
          assert_nil json_response["note"]
        end

        test "fetches a note successfully" do
          note = create(:note, member: create(:organization_membership, organization: @organization))
          create(:permission, user: @member.user, subject: note, action: :view)

          sign_in @member.user
          get organization_resource_mentions_path(@organization.slug, params: { url: note.url })

          assert_response :ok
          assert_response_gen_schema

          assert_equal note.url, json_response["id"]
          assert_not_nil json_response["note"]
          assert_nil json_response["post"]
          assert_nil json_response["call"]
        end

        test "returns 422 for invalid resource URL" do
          sign_in @member.user
          get organization_resource_mentions_path(@organization.slug, params: { url: "https://example.com/invalid/resource" })

          assert_response :unprocessable_entity
          assert_equal "Invalid resource URL", json_response["error"]
        end

        test "returns 422 for invalid URL" do
          sign_in @member.user
          get organization_resource_mentions_path(@organization.slug, params: { url: "boop" })

          assert_response :unprocessable_entity
          assert_equal "Invalid resource URL", json_response["error"]
        end

        test "returns 422 when user doesn't have access to post" do
          other_org = create(:organization)
          post = create(:post, organization: other_org)

          sign_in @member.user
          get organization_resource_mentions_path(@organization.slug, params: { url: post.url })

          assert_response :forbidden
        end

        test "returns 422 when user doesn't have access to call" do
          call = create(:call)

          sign_in @member.user
          get organization_resource_mentions_path(@organization.slug, params: { url: call.url })

          assert_response :forbidden
        end

        test "returns 422 when user doesn't have access to note" do
          note = create(:note)

          sign_in @member.user
          get organization_resource_mentions_path(@organization.slug, params: { url: note.url })

          assert_response :forbidden
        end
      end
    end
  end
end
