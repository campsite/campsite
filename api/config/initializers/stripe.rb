# frozen_string_literal: true

Stripe.api_key = Rails.application.credentials&.stripe&.secret_key
Stripe.max_network_retries = 2
