# frozen_string_literal: true

OpenAI.configure do |config|
  config.access_token = Rails.application.credentials.dig(:openai, :access_token)
  config.organization_id = Rails.application.credentials.dig(:openai, :organization_id)
  config.log_errors = Rails.env.development?
end
