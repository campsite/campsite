# frozen_string_literal: true

module Api
  module V1
    module OrganizationMemberships
      class SlackNotificationPreferencesController < V1::BaseController
        extend Apigen::Controller

        response code: 200 do
          { enabled: { type: :boolean } }
        end
        def show
          render(json: { enabled: current_organization_membership.slack_notifications_enabled? })
        end

        response code: 201
        def create
          current_organization_membership.enable_slack_notifications!
          render_created
        rescue OrganizationMembership::SlackNotificationPreferenceError => e
          render_unprocessable_entity(e)
        end

        response code: 204
        def destroy
          current_organization_membership.disable_slack_notifications!
        rescue OrganizationMembership::SlackNotificationPreferenceError => e
          render_unprocessable_entity(e)
        end
      end
    end
  end
end
