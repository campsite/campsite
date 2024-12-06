# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module Calls
      class AllRecordingsControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        setup do
          @member = create(:organization_membership)
          @organization = @member.organization
          call_peer = create(:call_peer, organization_membership: @member)
          @call = call_peer.call
        end

        context "#destroy" do
          setup do
            @call_recording = create(:call_recording, call: @call)
            @message = create(:message, call: @call)
          end

          test "deletes all the call's recordings and associated notifications for a call participant" do
            notification = create(:notification, target: @call, organization_membership: @member)

            sign_in(@member.user)

            assert_query_count 20 do
              delete organization_call_all_recordings_path(@organization.slug, @call.public_id)
            end

            assert_response :no_content
            assert_not CallRecording.exists?(@call_recording.id)
            assert_predicate notification.reload, :discarded?
            assert_enqueued_sidekiq_job(InvalidateMessageJob, args: [@message.sender.id, @message.id, "update-message"])
          end

          test "403s for non-participant" do
            sign_in(create(:user))

            delete organization_call_all_recordings_path(@organization.slug, @call.public_id)

            assert_response :forbidden
            assert CallRecording.exists?(@call_recording.id)
          end

          test "401s for logged-out user" do
            delete organization_call_all_recordings_path(@organization.slug, @call.public_id)

            assert_response :unauthorized
            assert CallRecording.exists?(@call_recording.id)
          end
        end
      end
    end
  end
end
