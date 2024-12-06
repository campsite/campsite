# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module MessageThreads
      class OtherMembershipsListsControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        setup do
          @member = create(:organization_membership)
          @organization = @member.organization
          @thread = create(:message_thread, :group, owner: @member)
          @existing_thread_membership_1 = @thread.memberships.where.not(organization_membership: @member).first
          @existing_thread_membership_2 = @thread.memberships.where.not(organization_membership: @member).second
          @new_member = create(:organization_membership, organization: @organization)
        end

        context "#update" do
          test "it updates thread members" do
            sign_in @member.user
            assert_query_count 23 do
              put organization_thread_other_memberships_list_path(@organization.slug, @thread.public_id), params: {
                member_ids: [@new_member.public_id, @existing_thread_membership_1.organization_membership.public_id],
              }
            end

            assert_response :success
            assert_response_gen_schema
            assert_equal 3, @thread.reload.memberships.count
            assert_includes @thread.organization_memberships, @member
            assert_includes @thread.organization_memberships, @new_member
            assert_includes @thread.organization_memberships, @existing_thread_membership_1.organization_membership
            assert_not_includes @thread.organization_memberships, @existing_thread_membership_2.organization_membership
            membership_update = @thread.membership_updates.last!
            assert_equal [@new_member.id], membership_update.added_organization_membership_ids
            assert_includes membership_update.removed_organization_membership_ids, @existing_thread_membership_2.organization_membership.id
          end

          test "it gracefully handles self ID, non-org member IDs, and duplicate IDs" do
            sign_in @member.user
            put organization_thread_other_memberships_list_path(@organization.slug, @thread.public_id), params: {
              member_ids: [
                @member.public_id,
                create(:organization_membership).public_id,
                @new_member.public_id,
                @new_member.public_id,
                @existing_thread_membership_1.organization_membership.public_id,
              ],
            }

            assert_response :success
            assert_response_gen_schema
            assert_equal 3, @thread.reload.memberships.count
            assert_includes @thread.organization_memberships, @member
            assert_includes @thread.organization_memberships, @new_member
            assert_includes @thread.organization_memberships, @existing_thread_membership_1.organization_membership
            assert_not_includes @thread.organization_memberships, @existing_thread_membership_2.organization_membership
          end

          test "it doesn't allow membership changes in a DM" do
            thread = create(:message_thread, :dm, owner: @member)

            sign_in @member.user
            put organization_thread_other_memberships_list_path(@organization.slug, thread.public_id)

            assert_response :forbidden
          end

          test "it doesn't allow non-thread member to update thread members" do
            sign_in @new_member.user
            put organization_thread_other_memberships_list_path(@organization.slug, @thread.public_id), params: {
              member_ids: [@new_member.public_id, @existing_thread_membership_1.organization_membership.public_id],
            }

            assert_response :not_found
          end

          test "it doesn't allow logged-out user to update thread members" do
            put organization_thread_other_memberships_list_path(@organization.slug, @thread.public_id), params: {
              member_ids: [@new_member.public_id, @existing_thread_membership_1.organization_membership.public_id],
            }

            assert_response :unauthorized
          end
        end
      end
    end
  end
end
