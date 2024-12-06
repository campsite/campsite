# frozen_string_literal: true

class GithubAccountSerializer < ApiSerializer
  api_field :public_id, name: :integration_id
  api_field :account_name, nullable: true
  api_field :account_type
  api_field :avatar_url, nullable: true
  api_field :account_suspended?, name: :suspended, type: :boolean
end
