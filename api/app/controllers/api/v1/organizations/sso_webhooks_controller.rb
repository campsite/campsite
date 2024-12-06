# frozen_string_literal: true

module Api
  module V1
    module Organizations
      class SsoWebhooksController < V1::BaseController
        skip_before_action :require_authenticated_user
        skip_before_action :require_authenticated_organization_membership, only: :create
        skip_before_action :require_org_two_factor_authentication
        skip_before_action :require_org_sso_authentication

        def create
          webhook = WorkOS::Webhooks.construct_event(
            payload: request.body.read,
            sig_header: request.headers["WorkOS-Signature"],
            secret: Rails.application.credentials&.workos&.webhook_secret,
          )

          case webhook.event
          when "connection.activated"
            WorkOsConnectionActivatedJob.perform_async(webhook.data[:id])
          else
            Sentry.capture_message("[WorkOS] webhook event not supported", extra: params)
          end

          head(:ok)
        rescue WorkOS::SignatureVerificationError
          head(:bad_request)
        end
      end
    end
  end
end
