# frozen_string_literal: true

class ZapierProjectSerializer < ApiSerializer
  api_field :public_id, name: :id
  api_field :name
end
