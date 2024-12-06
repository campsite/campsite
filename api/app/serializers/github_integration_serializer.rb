# frozen_string_literal: true

class GithubIntegrationSerializer < ApiSerializer
  api_field :public_id, name: :id
  api_field :provider
  api_field :installation_id
  api_field :account_name, nullable: true
  api_field :account_type, nullable: true
  api_field :avatar_url, nullable: true
  api_field :created_at
  api_field :setup_completed, type: :boolean do |object|
    object.integration_status == Github::Installation::GITHUB_COMPLETED_STATE
  end
end
