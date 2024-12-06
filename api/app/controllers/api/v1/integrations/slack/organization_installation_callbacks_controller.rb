# frozen_string_literal: true

module Api
  module V1
    module Integrations
      module Slack
        class OrganizationInstallationCallbacksController < ApplicationController
          around_action :force_database_writing_role, only: [:show]

          prepend_before_action -> { request.format = :html }, only: :show
          before_action :authenticate_user!, only: :show
          before_action :validate_state, only: :show

          include SlackCallbackable

          def show
            organization_membership = current_user.kept_organization_memberships.find_by!(organization: organization)
            authorize(organization, :create_slack_integration?)

            oauth = ::Slack::Web::Client.new.oauth_v2_access({
              client_id: slack_client_id,
              client_secret: slack_client_secret,
              code: params[:code],
              redirect_uri: organization_slack_integration_callback_url(organization.slug, subdomain: Campsite.api_subdomain),
            })

            if oauth
              integration = organization.integrations.find_or_initialize_by(provider: :slack)
              integration.update!(creator: current_user, token: oauth["access_token"])
              integration.find_or_initialize_data(IntegrationData::TEAM_ID).update!(value: oauth.dig("team", "id"))
              integration.find_or_initialize_data(IntegrationData::SCOPES).update!(value: oauth["scope"])
              SyncSlackChannelsV2Job.perform_async(integration.id)

              integration_organization_membership = integration
                .integration_organization_memberships
                .find_or_initialize_by(organization_membership: organization_membership)
              integration_organization_membership
                .find_or_initialize_data(IntegrationOrganizationMembershipData::INTEGRATION_USER_ID)
                .update!(value: oauth.dig("authed_user", "id"))

              if integration_auth_params[:enable_notifications] == "true" && !organization_membership.slack_notifications_enabled?
                organization_membership.enable_slack_notifications!
              end

              redirect_in_integration_auth_client(app_path: integration_auth_params[:success_path] || organization.settings_path)
            else
              @error_message = "Invalid access token"
              render("errors/show", status: :forbidden)
            end
          rescue ::Slack::Web::Api::Errors::SlackError, Pundit::NotAuthorizedError => ex
            @error_message = ex.message
            render("errors/show", status: :forbidden)
          end

          private

          def organization
            @organization ||= Organization.find_by!(slug: params[:org_slug])
          end
        end
      end
    end
  end
end
