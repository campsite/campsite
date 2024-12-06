# frozen_string_literal: true

class FigmaKeyPairSerializer < ApiSerializer
  api_field :read_key, type: :string
  api_field :write_key, type: :string
end
