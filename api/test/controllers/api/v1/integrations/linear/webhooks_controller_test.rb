# frozen_string_literal: true

require "test_helper"
require "test_helpers/linear_test_helper"

module Api
  module V1
    module Integrations
      module Linear
        class WebhooksControllerTest < ActionDispatch::IntegrationTest
          include LinearTestHelper

          setup do
            @integration_data = create(:linear_organization_id)
          end

          describe "#create" do
            describe "issue events" do
              it "enqueues a LinearEvents::HandleCreateIssueReferenceJob if a post is mentioned" do
                params = add_webhook_timestamp(JSON.parse(file_fixture("linear/issue_create.json").read))

                post = create(:post)
                params["data"]["description"] = post.url
                params["organizationId"] = @integration_data.value

                post linear_integration_webhooks_path,
                  params: params,
                  as: :json,
                  headers: linear_request_signature_headers(params: params)

                assert_response :ok

                assert_enqueued_sidekiq_job(::LinearEvents::HandleCreateIssueReferenceJob)
              end

              it "enqueues a LinearEvents::HandleIssueUpdateJob" do
                params = add_webhook_timestamp(JSON.parse(file_fixture("linear/issue_update.json").read))

                params["organizationId"] = @integration_data.value

                post linear_integration_webhooks_path,
                  params: params,
                  as: :json,
                  headers: linear_request_signature_headers(params: params)

                assert_response :ok
                assert_enqueued_sidekiq_job(LinearEvents::HandleIssueUpdateJob)
              end
            end

            describe "comment events" do
              it "enqueues a LinearEvents::HandleCreateCommentReferenceJob if a post is mentioned" do
                params = add_webhook_timestamp(JSON.parse(file_fixture("linear/comment_create.json").read))

                post = create(:post)
                params["data"]["body"] = post.url
                params["organizationId"] = @integration_data.value

                post linear_integration_webhooks_path,
                  params: params,
                  as: :json,
                  headers: linear_request_signature_headers(params: params)

                assert_response :ok

                assert_enqueued_sidekiq_job(::LinearEvents::HandleCreateCommentReferenceJob)
              end
            end

            it "returns 200 with an unsupported type" do
              params = add_webhook_timestamp(JSON.parse(file_fixture("linear/issue_payload.json").read))
              params.merge!(type: "not_a_real_event_type")

              post linear_integration_webhooks_path,
                params: add_webhook_timestamp(params),
                as: :json,
                headers: linear_request_signature_headers(params: params)

              assert_response :ok
            end

            it "returns 200 with an invalid organizationId" do
              params = add_webhook_timestamp(JSON.parse(file_fixture("linear/issue_create.json").read))

              post = create(:post)
              params["data"]["description"] = post.url
              params["organizationId"] = "not_a_real_organization_id"

              post linear_integration_webhooks_path,
                params: params,
                as: :json,
                headers: linear_request_signature_headers(params: params)

              assert_response :ok
              refute_enqueued_sidekiq_job(::LinearEvents::HandleCreateIssueReferenceJob)
            end

            it "returns 403 with an invalid signature" do
              params = add_webhook_timestamp(JSON.parse(file_fixture("linear/issue_payload.json").read))

              post linear_integration_webhooks_path,
                params: params,
                as: :json,
                headers: {
                  "HTTP_LINEAR_SIGNATURE" => "invalid_signature",
                }

              assert_response :forbidden
            end

            it "returns 403 with a timestamp older than a minute" do
              params = JSON.parse(file_fixture("linear/issue_payload.json").read)
              params.merge!(webhookTimestamp: 2.minutes.ago.to_i)

              post linear_integration_webhooks_path,
                params: params,
                as: :json,
                headers: linear_request_signature_headers(params: params)

              assert_response :forbidden
            end
          end
        end
      end
    end
  end
end
