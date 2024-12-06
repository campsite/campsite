# frozen_string_literal: true

module Api
  module V1
    module Integrations
      module Slack
        class ChannelsController < BaseController
          extend Apigen::Controller

          response model: SlackChannelPageSerializer, code: 200
          request_params do
            {
              after: { type: :string, required: false },
              q: { type: :string, required: false },
              limit: { type: :number, required: false },
            }
          end
          def index
            authorize(current_organization, :show_slack_integration?)

            scope = policy_scope(current_organization.slack_channels, policy_scope_class: SlackChannelPolicy::Scope)

            if params[:q]
              scope = scope.search_name(params[:q])
            end

            render_page(SlackChannelPageSerializer, scope)
          end

          response model: SlackChannelSerializer, code: 200
          def show
            authorize(current_organization, :show_slack_integration?)

            render_json(SlackChannelSerializer, current_organization.slack_channels.find_by!(provider_channel_id: params[:provider_channel_id]))
          end
        end
      end
    end
  end
end
