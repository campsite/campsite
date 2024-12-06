# frozen_string_literal: true

# Be sure to restart your server when you modify this file.

# Avoid CORS issues when API is called from the frontend app.
# Handle Cross-Origin Resource Sharing (CORS) in order to accept cross-origin AJAX requests.

# Read more: https://github.com/cyu/rack-cors

require "rack/cors"

Rails.application.config.middleware.insert_before(0, Rack::Cors) do
  allow do
    origins Campsite::DEV_APP_URL.hostname,
      "#{Campsite::DEV_APP_URL.hostname}:#{Campsite::DEV_APP_URL.port}",
      Campsite::PROD_DOT_COM_APP_URL.hostname,
      "localhost:3000",
      "campsite-api.fly.dev"

    resource "*",
      headers: :any,
      methods: [:get, :post, :put, :patch, :delete, :options, :head],
      credentials: true
  end

  allow do
    # allow requests from any origin for public api
    origins "*"

    resource "/v1/*",
      headers: :any,
      methods: [:get, :post, :put, :patch, :delete, :options, :head]
  end

  allow do
    # allow requests from any origin for figma sign-in
    # reasoning: the Figma plugin is in an iframe with a null origin
    origins "*"

    resource "/sign-in/figma",
      headers: :any,
      methods: [:post]
  end
end
