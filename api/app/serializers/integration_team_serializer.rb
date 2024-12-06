# frozen_string_literal: true

class IntegrationTeamSerializer < ApiSerializer
  api_field :public_id, name: :id
  api_field :name
  api_field :private
  api_field :provider_team_id
  api_field :key
end
