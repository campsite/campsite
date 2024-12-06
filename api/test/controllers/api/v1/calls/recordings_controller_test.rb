# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module Calls
      class RecordingsControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        setup do
          @member = create(:organization_membership)
          @organization = @member.organization
          call_peer = create(:call_peer, organization_membership: @member)
          @call = call_peer.call
          @call_recording = create(:call_recording, call: @call)
        end

        context "#index" do
          test "lists call recordings" do
            sign_in(@member.user)

            assert_query_count 9 do
              get organization_call_recordings_path(@organization.slug, @call.public_id)
            end

            assert_response :ok
            assert_response_gen_schema
            assert_equal 1, json_response["data"].size
            assert_equal @call_recording.public_id, json_response["data"].first["id"]
          end

          test "includes in-progress transcription state" do
            @call_recording.update!(transcription_started_at: 4.minutes.ago)

            sign_in(@member.user)
            get organization_call_recordings_path(@organization.slug, @call.public_id)

            assert_response :success
            assert_response_gen_schema
            assert_equal 1, json_response["data"].size
            assert_equal CallRecording::IN_PROGRESS_TRANSCRIPTION_STATUS, json_response["data"].first["transcription_status"]
          end

          test "includes completed transcription state" do
            @call_recording.update!(transcription_started_at: 4.minutes.ago, transcription_succeeded_at: 3.minutes.ago)

            sign_in(@member.user)
            get organization_call_recordings_path(@organization.slug, @call.public_id)

            assert_response :success
            assert_response_gen_schema
            assert_equal 1, json_response["data"].size
            assert_equal CallRecording::COMPLETED_TRANSCRIPTION_STATUS, json_response["data"].first["transcription_status"]
          end

          test "403s for non-participant" do
            sign_in(create(:organization_membership, organization: @organization).user)

            get organization_call_recordings_path(@organization.slug, @call.public_id)

            assert_response :forbidden
          end

          test "401s for logged-out user" do
            get organization_call_recordings_path(@organization.slug, @call.public_id)

            assert_response :unauthorized
          end
        end
      end
    end
  end
end
