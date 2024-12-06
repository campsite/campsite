# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module CallRecordings
      class TranscriptionsControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        setup do
          @recording = create(:call_recording, :with_transcription)
          thread = @recording.call.subject
          @organization = thread.organization
          @member = thread.organization_memberships.first!
          @call_peer = create(:call_peer, organization_membership: @member, call: @recording.call)
          @recording.speakers.create!(name: @member.display_name, call_peer: @call_peer)
        end

        context "#show" do
          test "works for org member with access to call subject" do
            sign_in @member.user
            get organization_call_recording_transcription_path(@organization.slug, @recording.public_id)

            assert_response :ok
            assert_response_gen_schema
            assert_equal @recording.transcription_vtt, json_response["vtt"]
            assert_equal 1, json_response["speakers"].count
            assert_equal @member.display_name, json_response["speakers"].first["name"]
            assert_equal @member.public_id, json_response["speakers"].first.dig("call_peer", "member", "id")
          end

          test "works for subjectless call" do
            @recording.call.room.update!(subject: nil)

            sign_in @member.user
            get organization_call_recording_transcription_path(@organization.slug, @recording.public_id)

            assert_response :ok
            assert_response_gen_schema
            assert_equal @recording.transcription_vtt, json_response["vtt"]
            assert_equal 1, json_response["speakers"].count
            assert_equal @member.display_name, json_response["speakers"].first["name"]
            assert_equal @member.public_id, json_response["speakers"].first.dig("call_peer", "member", "id")
          end

          test "query count" do
            sign_in @member.user

            assert_query_count 4 do
              get organization_call_recording_transcription_path(@organization.slug, @recording.public_id)
            end
          end

          test "returns nil vtt when recording doesn't have a transcription" do
            @recording.update!(transcription_vtt: nil)

            sign_in @member.user
            get organization_call_recording_transcription_path(@organization.slug, @recording.public_id)

            assert_response :ok
            assert_response_gen_schema
            assert_nil json_response["vtt"]
          end

          test "returns 403 for org member without access to call subject" do
            member = create(:organization_membership, organization: @organization)

            sign_in member.user
            get organization_call_recording_transcription_path(@organization.slug, @recording.public_id)

            assert_response :forbidden
          end
        end
      end
    end
  end
end
