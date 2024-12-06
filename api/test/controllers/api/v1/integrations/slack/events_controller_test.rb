# frozen_string_literal: true

require "test_helper"
require "test_helpers/slack_test_helper"

module Api
  module V1
    module Integrations
      module Slack
        class EventsControllerTest < ActionDispatch::IntegrationTest
          include Devise::Test::IntegrationHelpers
          include SlackTestHelper

          describe "#create" do
            describe "URL verification handshake" do
              test "returns the challenge" do
                challenge = "3eZbrw1aBm2rZgRNFdxV2595E9CY3gmdALWMmHkvFXO7tYXAYM8P"
                params = {
                  token: "Jhj5dZrVaK7ZwHHjRyZWjbDl",
                  challenge: challenge,
                  type: "url_verification",
                }

                post slack_integration_events_path,
                  params: params,
                  as: :json,
                  headers: slack_request_signature_headers(params: params)

                assert_response :ok
                assert_equal challenge, json_response["challenge"]
              end

              test "returns 403 when request is improperly signed" do
                challenge = "3eZbrw1aBm2rZgRNFdxV2595E9CY3gmdALWMmHkvFXO7tYXAYM8P"
                params = {
                  token: "Jhj5dZrVaK7ZwHHjRyZWjbDl",
                  challenge: challenge,
                  type: "url_verification",
                }

                post slack_integration_events_path,
                  params: params,
                  as: :json,
                  headers: slack_request_signature_headers(params: { invalid: "params" })

                assert_response :forbidden
              end
            end

            describe "handling app_uninstalled events" do
              test "enqueues a SlackEvents::HandleAppUninstalledJob" do
                params = JSON.parse(file_fixture("slack/app_uninstalled_event_payload.json").read)

                post slack_integration_events_path,
                  params: params,
                  as: :json,
                  headers: slack_request_signature_headers(params: params)

                assert_response :ok
                assert_enqueued_sidekiq_job(SlackEvents::HandleAppUninstalledJob)
              end
            end

            describe "handling link_shared events" do
              test "enqueues a SlackEvents::HandleLinkSharedJob" do
                params = JSON.parse(file_fixture("slack/link_shared_event_payload.json").read)

                post slack_integration_events_path,
                  params: params,
                  as: :json,
                  headers: slack_request_signature_headers(params: params)

                assert_response :ok
                assert_enqueued_sidekiq_job(SlackEvents::HandleLinkSharedJob)
              end

              test "returns 403 when request is improperly signed" do
                params = JSON.parse(file_fixture("slack/link_shared_event_payload.json").read)

                post slack_integration_events_path,
                  params: params,
                  as: :json,
                  headers: slack_request_signature_headers(params: { invalid: "params" })

                assert_response :forbidden
                assert_enqueued_sidekiq_jobs(0, only: SlackEvents::HandleLinkSharedJob)
              end
            end

            describe "handling channel_archive events" do
              test "enqueues a SlackEvents::HandleChannelCreatedJob" do
                params = JSON.parse(file_fixture("slack/channel_archive_event_payload.json").read)

                post slack_integration_events_path,
                  params: params,
                  as: :json,
                  headers: slack_request_signature_headers(params: params)

                assert_response :ok
                assert_enqueued_sidekiq_job(SlackEvents::HandleChannelArchiveJob)
              end
            end

            describe "handling channel_created events" do
              test "enqueues a SlackEvents::HandleChannelCreatedJob" do
                params = JSON.parse(file_fixture("slack/channel_created_event_payload.json").read)

                post slack_integration_events_path,
                  params: params,
                  as: :json,
                  headers: slack_request_signature_headers(params: params)

                assert_response :ok
                assert_enqueued_sidekiq_job(SlackEvents::HandleChannelCreatedJob)
              end
            end

            describe "handling channel_deleted events" do
              test "enqueues a SlackEvents::HandleChannelDeletedJob" do
                params = JSON.parse(file_fixture("slack/channel_deleted_event_payload.json").read)

                post slack_integration_events_path,
                  params: params,
                  as: :json,
                  headers: slack_request_signature_headers(params: params)

                assert_response :ok
                assert_enqueued_sidekiq_job(SlackEvents::HandleChannelDeletedJob)
              end
            end

            describe "handling channel_rename events" do
              test "enqueues a SlackEvents::HandleChannelRenameJob" do
                params = JSON.parse(file_fixture("slack/channel_rename_event_payload.json").read)

                post slack_integration_events_path,
                  params: params,
                  as: :json,
                  headers: slack_request_signature_headers(params: params)

                assert_response :ok
                assert_enqueued_sidekiq_job(SlackEvents::HandleChannelRenameJob)
              end
            end

            describe "handling channel_unarchive events" do
              test "enqueues a SlackEvents::HandleChannelUnarchiveJob" do
                params = JSON.parse(file_fixture("slack/channel_unarchive_event_payload.json").read)

                post slack_integration_events_path,
                  params: params,
                  as: :json,
                  headers: slack_request_signature_headers(params: params)

                assert_response :ok
                assert_enqueued_sidekiq_job(SlackEvents::HandleChannelUnarchiveJob)
              end
            end

            describe "handling group_archive events" do
              test "enqueues a SlackEvents::HandleGroupArchivedJob" do
                params = JSON.parse(file_fixture("slack/group_archive_event_payload.json").read)

                post slack_integration_events_path,
                  params: params,
                  as: :json,
                  headers: slack_request_signature_headers(params: params)

                assert_response :ok
                assert_enqueued_sidekiq_job(SlackEvents::HandleGroupArchiveJob)
              end
            end

            describe "handling group_deleted events" do
              test "enqueues a SlackEvents::HandleGroupDeletedJob" do
                params = JSON.parse(file_fixture("slack/group_deleted_event_payload.json").read)

                post slack_integration_events_path,
                  params: params,
                  as: :json,
                  headers: slack_request_signature_headers(params: params)

                assert_response :ok
                assert_enqueued_sidekiq_job(SlackEvents::HandleGroupDeletedJob)
              end
            end

            describe "handling group_left events" do
              test "enqueues a SlackEvents::HandleGroupLeftJob" do
                params = JSON.parse(file_fixture("slack/group_left_event_payload.json").read)

                post slack_integration_events_path,
                  params: params,
                  as: :json,
                  headers: slack_request_signature_headers(params: params)

                assert_response :ok
                assert_enqueued_sidekiq_job(SlackEvents::HandleGroupLeftJob)
              end
            end

            describe "handling group_rename events" do
              test "enqueues a SlackEvents::HandleGroupRenameJob" do
                params = JSON.parse(file_fixture("slack/group_rename_event_payload.json").read)

                post slack_integration_events_path,
                  params: params,
                  as: :json,
                  headers: slack_request_signature_headers(params: params)

                assert_response :ok
                assert_enqueued_sidekiq_job(SlackEvents::HandleGroupRenameJob)
              end
            end

            describe "handling group_unarchive events" do
              test "enqueues a SlackEvents::HandleGroupUnarchiveJob" do
                params = JSON.parse(file_fixture("slack/group_unarchive_event_payload.json").read)

                post slack_integration_events_path,
                  params: params,
                  as: :json,
                  headers: slack_request_signature_headers(params: params)

                assert_response :ok
                assert_enqueued_sidekiq_job(SlackEvents::HandleGroupUnarchiveJob)
              end
            end

            describe "handling member_joined_channel events" do
              test "enqueues a SlackEvents::HandleMemberJoinedChannelJob" do
                params = JSON.parse(file_fixture("slack/member_joined_channel_event_payload.json").read)

                post slack_integration_events_path,
                  params: params,
                  as: :json,
                  headers: slack_request_signature_headers(params: params)

                assert_response :ok
                assert_enqueued_sidekiq_job(SlackEvents::HandleMemberJoinedChannelJob)
              end
            end

            describe "handling member_left_channel events" do
              test "enqueues a SlackEvents::HandleMemberLeftChannelJob" do
                params = JSON.parse(file_fixture("slack/member_left_channel_event_payload.json").read)

                post slack_integration_events_path,
                  params: params,
                  as: :json,
                  headers: slack_request_signature_headers(params: params)

                assert_response :ok
                assert_enqueued_sidekiq_job(SlackEvents::HandleMemberLeftChannelJob)
              end
            end

            describe "handling app_home_opened events" do
              test "no-op" do
                params = JSON.parse(file_fixture("slack/app_home_opened_event_payload.json").read)

                post slack_integration_events_path,
                  params: params,
                  as: :json,
                  headers: slack_request_signature_headers(params: params)

                assert_response :ok
                assert_enqueued_sidekiq_job(SlackEvents::HandleAppHomeOpenedJob)
              end
            end

            describe "with an unexpected type" do
              test "returns 422" do
                params = {
                  token: "Jhj5dZrVaK7ZwHHjRyZWjbDl",
                  type: "not_a_real_event_type",
                }

                post slack_integration_events_path,
                  params: params,
                  as: :json,
                  headers: slack_request_signature_headers(params: params)

                assert_response :unprocessable_entity
                assert_equal "unrecognized Slack event type", json_response["message"]
              end
            end
          end
        end
      end
    end
  end
end
