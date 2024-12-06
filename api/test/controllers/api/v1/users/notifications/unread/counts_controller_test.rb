# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module Users
      module Notifications
        module Unread
          class CountsControllerTest < ActionDispatch::IntegrationTest
            include Devise::Test::IntegrationHelpers

            context "#show" do
              test "returns latest unread notification count for the current user by organization" do
                user = create(:user)
                member_1 = create(:organization_membership, user: user)
                member_2 = create(:organization_membership, user: user)
                member_3 = create(:organization_membership, user: user)
                org_1 = member_1.organization
                org_2 = member_2.organization
                org_3 = member_3.organization
                org_1_target_1 = create(:post, organization: org_1)
                org_1_target_2 = create(:post, organization: org_1)
                org_3_target_1 = create(:post, organization: org_3)
                create(:notification, organization_membership: member_1, target: org_1_target_1)
                create(:notification, organization_membership: member_1, target: org_1_target_1)
                create(:notification, :read, organization_membership: member_1, target: org_1_target_2)
                create(:notification, :discarded, organization_membership: member_1, target: org_1_target_2)
                create(:notification, :archived, organization_membership: member_1, target: org_1_target_2)
                create(:notification, organization_membership: member_3, target: org_3_target_1)

                sign_in(user)
                get users_unread_notifications_all_count_path

                assert_response :ok
                assert_response_gen_schema
                assert_equal 1, json_response["inbox"][org_1.slug]
                assert_nil json_response["inbox"][org_2.slug]
                assert_equal 1, json_response["inbox"][org_3.slug]
              end
            end
          end
        end
      end
    end
  end
end
