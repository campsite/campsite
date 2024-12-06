# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module Organizations
      class SsoWebhooksControllerTest < ActionDispatch::IntegrationTest
        setup do
          @secret = Rails.application.credentials&.workos&.webhook_secret
          @connection_data = workos_connection_fixture.to_json
          @timestamp = Time.at(Time.now.to_i * 1000).to_i
        end

        def stub_event(identifier)
          JSON.parse(File.read("spec/support/fixtures/#{identifier}.json"))
        end

        def generate_signature(params)
          signature = WorkOS::Webhooks.compute_signature(
            timestamp: @timestamp.to_s,
            payload: params.to_json,
            secret: @secret,
          )

          "t=#{@timestamp}, v1=#{signature}"
        end

        def webhook(signature, params)
          post(organizations_sso_webhooks_path, params: params, headers: { "WorkOS-Signature" => signature }, as: :json)
        end

        def webhook_with_signature(params)
          webhook(generate_signature(params), params)
        end

        context "without a signing secret" do
          it "returns an error message" do
            webhook "invalid signature", { foo: "bar" }

            assert_response :bad_request
          end
        end

        context "with a valid signing secret" do
          context "connection.activated webhook" do
            test "queues WorkOsConnectionActivatedJob" do
              webhook_with_signature({
                id: "wh_123",
                event: "connection.activated",
                data: @connection_data,
              })

              assert_response :ok
              assert_enqueued_sidekiq_job(WorkOsConnectionActivatedJob, args: [@connection_data[:id]])
            end
          end

          context "unsupported webhook" do
            test "logs the event to sentry" do
              Sentry.expects(:capture_message)

              webhook_with_signature({
                id: "wh_123",
                event: "connection.deactivated",
                data: @connection_data,
              })

              assert_response :ok
            end
          end
        end
      end
    end
  end
end
