# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module Notifications
      class ArchivesControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        setup do
          @notified_member = create(:organization_membership)
          @notification = create(:notification, organization_membership: @notified_member)
        end

        context "#destroy" do
          test "notified user can unarchive notification" do
            @notification.archive!
            sign_in(@notified_member.user)

            delete organization_notification_archive_path(@notified_member.organization, @notification.public_id)

            assert_response :no_content
            assert_not_predicate @notification.reload, :archived?
          end

          test "random user cannot unarchive notified user's notification" do
            @notification.archive!
            sign_in(create(:user))

            delete organization_notification_archive_path(@notified_member.organization, @notification.public_id)

            assert_response :forbidden
            assert_predicate @notification.reload, :archived?
          end
        end
      end
    end
  end
end
