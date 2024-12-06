# frozen_string_literal: true

WorkOS.configure do |config|
  config.key = Rails.application.credentials&.workos&.api_key
  config.timeout = 120
end
