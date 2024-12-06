# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module Integrations
      module Hms
        class EventsControllerTest < ActionDispatch::IntegrationTest
          include Devise::Test::IntegrationHelpers

          describe "#create" do
            test "handles session.open.success events" do
              params = JSON.parse(file_fixture("hms/session_open_success_event_payload.json").read)
              headers = { "X-Passcode" => Rails.application.credentials.hms.webhook_passcode }

              post hms_integration_events_path, as: :json, params: params, headers: headers

              assert_response :ok
              assert_enqueued_sidekiq_job(HmsEvents::HandleSessionOpenSuccessJob)
            end

            test "handles session.close.success events" do
              params = JSON.parse(file_fixture("hms/session_close_success_event_payload.json").read)
              headers = { "X-Passcode" => Rails.application.credentials.hms.webhook_passcode }

              post hms_integration_events_path, as: :json, params: params, headers: headers

              assert_response :ok
              assert_enqueued_sidekiq_job(HmsEvents::HandleSessionCloseSuccessJob)
            end

            test "handles peer.join.success events" do
              params = JSON.parse(file_fixture("hms/peer_join_success_event_payload.json").read)
              headers = { "X-Passcode" => Rails.application.credentials.hms.webhook_passcode }

              post hms_integration_events_path, as: :json, params: params, headers: headers

              assert_response :ok
              assert_enqueued_sidekiq_job(HmsEvents::HandlePeerJoinSuccessJob)
            end

            test "handles peer.leave.success events" do
              params = JSON.parse(file_fixture("hms/peer_leave_success_event_payload.json").read)
              headers = { "X-Passcode" => Rails.application.credentials.hms.webhook_passcode }

              post hms_integration_events_path, as: :json, params: params, headers: headers

              assert_response :ok
              assert_enqueued_sidekiq_job(HmsEvents::HandlePeerLeaveSuccessJob)
            end

            test "handles beam.started.success events" do
              params = JSON.parse(file_fixture("hms/beam_started_success_event_payload.json").read)
              headers = { "X-Passcode" => Rails.application.credentials.hms.webhook_passcode }

              post hms_integration_events_path, as: :json, params: params, headers: headers

              assert_response :ok
              assert_enqueued_sidekiq_job(HmsEvents::HandleBeamStartedSuccessJob)
            end

            test "handles beam.stopped.success events" do
              params = JSON.parse(file_fixture("hms/beam_stopped_success_event_payload.json").read)
              headers = { "X-Passcode" => Rails.application.credentials.hms.webhook_passcode }

              post hms_integration_events_path, as: :json, params: params, headers: headers

              assert_response :ok
              assert_enqueued_sidekiq_job(HmsEvents::HandleBeamStoppedSuccessJob)
            end

            test "handles beam.recording.success events" do
              params = JSON.parse(file_fixture("hms/beam_recording_success_event_payload.json").read)
              headers = { "X-Passcode" => Rails.application.credentials.hms.webhook_passcode }

              post hms_integration_events_path, as: :json, params: params, headers: headers

              assert_response :ok
              assert_enqueued_sidekiq_job(HmsEvents::HandleBeamRecordingSuccessJob)
            end

            test "handles beam.failure events" do
              params = JSON.parse(file_fixture("hms/beam_failure_event_payload.json").read)
              headers = { "X-Passcode" => Rails.application.credentials.hms.webhook_passcode }

              post hms_integration_events_path, as: :json, params: params, headers: headers

              assert_response :ok
              assert_enqueued_sidekiq_job(HmsEvents::HandleBeamFailureJob)
            end

            test "handles transcription.started.success events" do
              params = JSON.parse(file_fixture("hms/transcription_started_success_event_payload.json").read)
              headers = { "X-Passcode" => Rails.application.credentials.hms.webhook_passcode }

              post hms_integration_events_path, as: :json, params: params, headers: headers

              assert_response :ok
              assert_enqueued_sidekiq_job(HmsEvents::HandleTranscriptionStartedSuccessJob)
            end

            test "handles transcription.success events" do
              params = JSON.parse(file_fixture("hms/transcription_success_event_payload.json").read)
              headers = { "X-Passcode" => Rails.application.credentials.hms.webhook_passcode }

              post hms_integration_events_path, as: :json, params: params, headers: headers

              assert_response :ok
              assert_enqueued_sidekiq_job(HmsEvents::HandleTranscriptionSuccessJob)
            end

            test "handles transcription.failure events" do
              params = JSON.parse(file_fixture("hms/transcription_failure_event_payload.json").read)
              headers = { "X-Passcode" => Rails.application.credentials.hms.webhook_passcode }

              post hms_integration_events_path, as: :json, params: params, headers: headers

              assert_response :ok
              assert_enqueued_sidekiq_job(HmsEvents::HandleTranscriptionFailureJob)
            end

            test "returns error if webhook signing secret is incorrect" do
              params = JSON.parse(file_fixture("hms/session_open_success_event_payload.json").read)
              headers = { "X-Passcode" => "not-the-passcode" }

              post hms_integration_events_path, as: :json, params: params, headers: headers

              assert_response :unprocessable_entity
            end
          end
        end
      end
    end
  end
end
