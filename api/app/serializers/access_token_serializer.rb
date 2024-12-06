# frozen_string_literal: true

class AccessTokenSerializer < ApiSerializer
  api_field :plaintext_token, name: :token
end
