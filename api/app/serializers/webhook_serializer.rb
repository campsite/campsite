# frozen_string_literal: true

class WebhookSerializer < ApiSerializer
  api_field :public_id, name: :id
  api_field :url
  api_field :state
  api_field :secret
  api_field :event_types, is_array: true
end
