# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module Pusher
      class AuthsControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        setup do
          @user = create(:user)
        end

        context "#show" do
          test "grants access to private Pusher channel for authorized user" do
            socket_id = "123.456"
            expected_auth_value = "874a1de2f18896929939:846d3815e5b2fe41d2d4b728612b12de8019d6dfa6140a94b5cc59febd337cbb"
            ::Pusher.expects(:authenticate).with(@user.channel_name, socket_id, user_id: @user.public_id).returns(auth: expected_auth_value)

            sign_in(@user)
            post pusher_auths_path(channel_name: @user.channel_name, socket_id: socket_id, user_id: @user.public_id)

            assert_response :success
            assert_equal expected_auth_value, json_response["auth"]
          end

          test "grants access to private figma Pusher channel for any user" do
            @figma_key_pair = FigmaKeyPair.generate
            socket_id = "123.456"
            expected_auth_value = "874a1de2f18896929939:846d3815e5b2fe41d2d4b728612b12de8019d6dfa6140a94b5cc59febd337cbb"
            ::Pusher.expects(:authenticate).with(@figma_key_pair.channel_name, socket_id, user_id: nil).returns(auth: expected_auth_value)

            post pusher_auths_path(channel_name: @figma_key_pair.channel_name, socket_id: socket_id)

            assert_response :success
            assert_equal expected_auth_value, json_response["auth"]
          end

          test "grants access to organization presence Pusher channel for authorized member" do
            member = create(:organization_membership)
            organization = member.organization
            user = member.user
            socket_id = "123.456"
            expected_auth_value = "874a1de2f18896929939:846d3815e5b2fe41d2d4b728612b12de8019d6dfa6140a94b5cc59febd337cbb"
            ::Pusher.expects(:authenticate).with(organization.presence_channel_name, socket_id, user_id: user.public_id).returns(auth: expected_auth_value)

            sign_in user
            post pusher_auths_path(channel_name: organization.presence_channel_name, socket_id: socket_id)

            assert_response :success
            assert_equal expected_auth_value, json_response["auth"]
          end

          test "grants member access to a private thread Pusher channel for project chat" do
            member = create(:organization_membership)
            organization = member.organization
            user = member.user
            thread = create(:message_thread, owner: create(:organization_membership, organization: organization))
            create(:project, message_thread: thread, organization: organization)
            socket_id = "123.456"
            expected_auth_value = "874a1de2f18896929939:846d3815e5b2fe41d2d4b728612b12de8019d6dfa6140a94b5cc59febd337cbb"
            ::Pusher.expects(:authenticate).with(organization.presence_channel_name, socket_id, user_id: user.public_id).returns(auth: expected_auth_value)

            sign_in user
            post pusher_auths_path(channel_name: organization.presence_channel_name, socket_id: socket_id)

            assert_response :success
            assert_equal expected_auth_value, json_response["auth"]
          end

          test "denies member access to a private thread Pusher channel for a private project chat they aren't a member of" do
            member = create(:organization_membership)
            organization = member.organization
            user = member.user
            thread = create(:message_thread, owner: create(:organization_membership, organization: organization))
            create(:project, :private, message_thread: thread, organization: organization)
            socket_id = "123.456"
            expected_auth_value = "874a1de2f18896929939:846d3815e5b2fe41d2d4b728612b12de8019d6dfa6140a94b5cc59febd337cbb"
            ::Pusher.expects(:authenticate).with(organization.presence_channel_name, socket_id, user_id: user.public_id).returns(auth: expected_auth_value)

            sign_in user
            post pusher_auths_path(channel_name: organization.presence_channel_name, socket_id: socket_id)

            assert_response :success
            assert_equal expected_auth_value, json_response["auth"]
          end

          test "denies access to private Pusher channel for unauthorized user" do
            sign_in(@user)
            post pusher_auths_path(channel_name: "private-user-somebodyelse", socket_id: "123.456")

            assert_response :forbidden
          end

          test "denies access to private Pusher channel for anonymous user" do
            post pusher_auths_path(channel_name: "private-user-somebodyelse", socket_id: "123.456")

            assert_response :forbidden
          end

          test "denies access to organization presence Pusher channel for non-member" do
            organization = create(:organization)
            socket_id = "123.456"

            sign_in @user
            post pusher_auths_path(channel_name: organization.presence_channel_name, socket_id: socket_id)

            assert_response :forbidden
          end
        end
      end
    end
  end
end
