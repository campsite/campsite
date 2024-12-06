# frozen_string_literal: true

module Api
  module V1
    class SlackIntegrationsController < BaseController
      skip_before_action :require_authenticated_user, only: :ack
      skip_before_action :require_authenticated_organization_membership, only: :ack
      before_action :validate_request, only: :ack

      extend Apigen::Controller
      include SlackEventRequestValidatable

      # Slack requires all interactive elements, like buttons, to send a callback to an endpoint.
      # In order to show a "View on Campsite" button, we have to have a dummy endpoint that returns a 200.
      # More: https://github.com/slackapi/node-slack-sdk/issues/869
      # This is dumb.
      def ack
        render_ok
      end

      response model: SlackIntegrationSerializer, code: 200
      def show
        authorize(current_organization, :show_slack_integration?)

        view = current_organization.admin?(current_user) ? :with_token : nil
        if current_organization.slack_integration
          render_json(
            SlackIntegrationSerializer,
            current_organization.slack_integration,
            {
              view: view,
              current_organization_membership: current_organization_membership,
            },
          )
        else
          render(status: :ok, json: nil)
        end
      end

      response code: 204
      def destroy
        authorize(current_organization, :destroy_slack_integration?)

        current_organization.slack_integration&.destroy!
        current_organization.update!(slack_channel_id: nil)
        current_organization.projects.where.not(slack_channel_id: nil).update_all(slack_channel_id: nil)
      end
    end
  end
end
