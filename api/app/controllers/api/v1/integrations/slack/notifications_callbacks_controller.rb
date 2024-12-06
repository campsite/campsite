# frozen_string_literal: true

module Api
  module V1
    module Integrations
      module Slack
        class NotificationsCallbacksController < ApplicationController
          around_action :force_database_writing_role, only: [:show]

          prepend_before_action -> { request.format = :html }, only: :show
          before_action :authenticate_user!, only: :show
          before_action :validate_state, only: :show

          include SlackCallbackable

          def show
            oauth = ::Slack::Web::Client.new.oauth_v2_access({
              client_id: slack_client_id,
              client_secret: slack_client_secret,
              code: params[:code],
              redirect_uri: organization_integrations_slack_notifications_callback_url(organization.slug, subdomain: Campsite.api_subdomain),
            })

            if integration.data.find_by(name: IntegrationData::TEAM_ID, value: oauth.dig("team", "id"))
              integration_organization_membership = integration
                .integration_organization_memberships
                .find_or_initialize_by(organization_membership: organization_membership)
              integration_organization_membership
                .find_or_initialize_data(IntegrationOrganizationMembershipData::INTEGRATION_USER_ID)
                .update!(value: oauth.dig("authed_user", "id"))
              organization_membership.enable_slack_notifications! unless organization_membership.slack_notifications_enabled?

              redirect_in_integration_auth_client(app_path: integration_auth_params[:success_path] || Campsite.user_settings_path)
            else
              @error_message = "This Slack workspace did not match your organization's Slack workspace. Please try again."
              render("errors/show", status: :forbidden)
            end
          rescue ::Slack::Web::Api::Errors::SlackError => ex
            @error_message = ex.message
            render("errors/show", status: :forbidden)
          end

          private

          def organization
            @organization ||= Organization.find_by!(slug: params[:org_slug])
          end

          def organization_membership
            @organization_membership ||= current_user.kept_organization_memberships.find_by!(organization: organization)
          end

          def integration
            @integration ||= organization.integrations.find_by!(provider: :slack)
          end
        end
      end
    end
  end
end
