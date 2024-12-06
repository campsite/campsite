# frozen_string_literal: true

Slack::Events.configure do |config|
  config.signing_secret = Rails.application.credentials&.slack&.signing_secret
end
