# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module MessageThreads
      class MyMembershipsControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        setup do
          @member = create(:organization_membership)
          @organization = @member.organization
          @thread = create(:message_thread, :group, owner: @member)
          @thread_membership = @thread.memberships.find_by(organization_membership: @member)
        end

        context "#show" do
          test "it returns the current member's membership for the thread" do
            sign_in @member.user
            get organization_thread_my_membership_path(@organization.slug, @thread.public_id)

            assert_response :ok
          end

          test "it doesn't allow non-thread member to view membership" do
            sign_in create(:organization_membership, organization: @organization).user
            get organization_thread_my_membership_path(@organization.slug, @thread.public_id)

            assert_response :not_found
          end
        end

        context "#update" do
          test "it updates the current member's notification level for the thread" do
            sign_in @member.user
            assert_changes -> { @thread_membership.reload.notification_level }, from: "all", to: "none" do
              patch organization_thread_my_membership_path(@organization.slug, @thread.public_id), params: { notification_level: "none" }
            end

            assert_response :no_content
          end

          test "it doesn't allow current member to update notification level to invalid value" do
            sign_in @member.user
            patch organization_thread_my_membership_path(@organization.slug, @thread.public_id), params: { notification_level: "invalid" }

            assert_response :unprocessable_entity
          end

          test "it doesn't allow non-thread member to update notification level" do
            sign_in create(:organization_membership, organization: @organization).user
            patch organization_thread_my_membership_path(@organization.slug, @thread.public_id), params: { notification_level: "none" }

            assert_response :not_found
          end

          test "it doesn't allow logged-out user to update notification level" do
            patch organization_thread_my_membership_path(@organization.slug, @thread.public_id), params: { notification_level: "none" }

            assert_response :unauthorized
          end
        end

        context "#destroy" do
          test "it removes the current member from the thread" do
            sign_in @member.user
            assert_query_count 15 do
              assert_changes -> { @thread.organization_memberships.count }, -1 do
                delete organization_thread_my_membership_path(@organization.slug, @thread.public_id)
              end
            end

            assert_response :no_content
            assert_not_includes @thread.reload.organization_memberships, @member
            membership_update = @thread.membership_updates.last!
            assert_nil membership_update.added_organization_membership_ids
            assert_equal [@member.id], membership_update.removed_organization_membership_ids
          end

          test "it removes the favorite if it existed" do
            @thread.favorites.create!(organization_membership: @member)
            assert_equal @thread.favorites.count, 1

            sign_in @member.user
            delete organization_thread_my_membership_path(@organization.slug, @thread.public_id)

            assert_response :no_content
            assert_equal @thread.favorites.count, 0
          end

          test "it doesn't allow current member to leave thread if only one other member" do
            thread = create(:message_thread, :dm, owner: @member)

            sign_in @member.user
            assert_no_difference -> { thread.organization_memberships.count } do
              delete organization_thread_my_membership_path(@organization.slug, thread.public_id)
            end

            assert_response :forbidden
          end

          test "it doesn't allow non-thread member to remove self from thread" do
            sign_in create(:organization_membership, organization: @organization).user
            delete organization_thread_my_membership_path(@organization.slug, @thread.public_id)

            assert_response :not_found
          end

          test "it doesn't allow logged-out user to remove self from thread" do
            delete organization_thread_my_membership_path(@organization.slug, @thread.public_id)

            assert_response :unauthorized
          end
        end
      end
    end
  end
end
