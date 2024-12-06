# frozen_string_literal: true

class LinearIntegrationSerializer < ApiSerializer
  api_field :public_id, name: :id
  api_field :provider
end
