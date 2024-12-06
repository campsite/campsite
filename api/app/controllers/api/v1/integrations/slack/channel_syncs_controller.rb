# frozen_string_literal: true

module Api
  module V1
    module Integrations
      module Slack
        class ChannelSyncsController < BaseController
          extend Apigen::Controller

          response code: 204
          def create
            authorize(current_organization, :show_slack_integration?)
            return unless current_organization.slack_integration

            SyncSlackChannelsV2Job.perform_async(current_organization.slack_integration.id)
          end
        end
      end
    end
  end
end
