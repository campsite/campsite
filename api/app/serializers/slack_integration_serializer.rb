# frozen_string_literal: true

class SlackIntegrationSerializer < ApiSerializer
  api_field :public_id, name: :id
  api_field :provider
  api_field :has_link_unfurling_scopes?, name: :has_link_unfurling_scopes, type: :boolean
  api_field :only_scoped_for_notifications?, name: :only_scoped_for_notifications, type: :boolean
  api_field :has_private_channel_scopes?, name: :has_private_channel_scopes, type: :boolean

  api_field :current_organization_membership_is_linked, type: :boolean, if: ->(_field_name, _integration, options) { options[:member] } do |_integration, options|
    options[:member].linked_to_slack?
  end

  api_field :token, view: :with_token

  api_field :team_id, nullable: true do |integration|
    integration.data.find_by(name: IntegrationData::TEAM_ID)&.value
  end
end
